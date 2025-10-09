import { NextRequest } from "next/server";
import { Kafka } from "kafkajs";

// Initialize Kafka client for broker running on localhost:9092
const kafka = new Kafka({
  clientId: "web-dashboard-stream-consumer",
  brokers: ["localhost:9092"], // Updated to use port 9092
});

// Server-Sent Events endpoint for real-time transaction streaming
export async function GET(request: NextRequest) {
  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(
        `data: ${JSON.stringify({
          type: "connection",
          message: "Connecting to Kafka broker on localhost:9092...",
          timestamp: new Date().toISOString(),
        })}\n\n`
      );

      try {
        // Create Kafka consumer
        const consumer = kafka.consumer({
          groupId: `web-dashboard-stream-${Date.now()}`,
          sessionTimeout: 30000,
          heartbeatInterval: 3000,
        });

        // Connect to Kafka
        await consumer.connect();
        console.log(
          "Stream consumer connected to Kafka broker on localhost:9092"
        );

        // Send connected message
        controller.enqueue(
          `data: ${JSON.stringify({
            type: "connection",
            message:
              "Connected to Kafka broker - listening for transactions...",
            timestamp: new Date().toISOString(),
          })}\n\n`
        );

        // Subscribe to the ml_predictions topic
        await consumer.subscribe({
          topic: "ml_predictions",
          fromBeginning: false,
        });

        // Start consuming messages
        await consumer.run({
          eachMessage: async ({ topic, partition, message }) => {
            try {
              if (message.value) {
                const transactionData = JSON.parse(message.value.toString());

                // Transform to match our dashboard interface
                const transformedTransaction = {
                  type: "transaction",
                  data: {
                    id: transactionData.id || Date.now(),
                    trans_num: transactionData.trans_num,
                    amount: transactionData.amt,
                    merchant: transactionData.merchant,
                    category: transactionData.category,
                    customer: `${transactionData.first} ${transactionData.last}`,
                    city: transactionData.city,
                    state: transactionData.state,
                    is_fraud: Boolean(transactionData.is_fraud),
                    timestamp:
                      transactionData.trans_date_trans_time ||
                      new Date().toISOString(),
                  },
                };

                // Send transaction to client
                controller.enqueue(
                  `data: ${JSON.stringify(transformedTransaction)}\n\n`
                );
              }
            } catch (parseError) {
              console.error("Error parsing Kafka message:", parseError);
              controller.enqueue(
                `data: ${JSON.stringify({
                  type: "error",
                  message: "Error parsing transaction data",
                  timestamp: new Date().toISOString(),
                })}\n\n`
              );
            }
          },
        });

        // Clean up on client disconnect
        request.signal?.addEventListener("abort", async () => {
          console.log("Client disconnected, closing Kafka consumer");
          try {
            await consumer.disconnect();
          } catch (error) {
            console.error("Error disconnecting consumer:", error);
          }
          controller.close();
        });
      } catch (kafkaError) {
        console.error("Kafka connection error:", kafkaError);

        // Send error message
        controller.enqueue(
          `data: ${JSON.stringify({
            type: "error",
            message:
              "Failed to connect to Kafka broker on localhost:9092. Please start your Kafka producer.",
            error:
              kafkaError instanceof Error
                ? kafkaError.message
                : String(kafkaError),
            timestamp: new Date().toISOString(),
          })}\n\n`
        );

        // Close the connection instead of sending mock data
        setTimeout(() => {
          controller.close();
        }, 1000);

        // Clean up on client disconnect
        request.signal?.addEventListener("abort", () => {
          controller.close();
        });
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Cache-Control",
    },
  });
}
