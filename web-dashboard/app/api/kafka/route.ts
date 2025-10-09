import { NextRequest, NextResponse } from "next/server";
import { Kafka } from "kafkajs";

// Initialize Kafka client for broker running on localhost:9092
const kafka = new Kafka({
  clientId: "web-dashboard-consumer",
  brokers: ["localhost:9092"], // Updated to use port 9092
});

let consumerInstance: any = null;
let isConnected = false;

export async function GET() {
  try {
    // Create a new consumer instance
    const consumer = kafka.consumer({
      groupId: "web-dashboard-group",
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });

    const messages: any[] = [];
    let messageCount = 0;
    const maxMessages = 10; // Limit for API call

    try {
      // Connect to Kafka
      await consumer.connect();
      console.log("Connected to Kafka broker on localhost:9092");

      // Subscribe to the ml_predictions topic (same as your producer)
      await consumer.subscribe({
        topic: "ml_predictions",
        fromBeginning: false,
      });

      // Set up message handler with timeout
      const messagePromise = new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve(messages);
        }, 5000); // 5 second timeout

        consumer.run({
          eachMessage: async ({ topic, partition, message }) => {
            try {
              if (message.value) {
                const transactionData = JSON.parse(message.value.toString());

                // Transform to match our dashboard interface
                const transformedTransaction = {
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
                };

                messages.push(transformedTransaction);
                messageCount++;

                if (messageCount >= maxMessages) {
                  clearTimeout(timeout);
                  resolve(messages);
                }
              }
            } catch (parseError) {
              console.error("Error parsing message:", parseError);
            }
          },
        });
      });

      // Wait for messages or timeout
      await messagePromise;
    } catch (kafkaError) {
      console.error("Kafka connection error:", kafkaError);

      // Return empty data when Kafka is not available (no mock data)
      return NextResponse.json({
        success: false,
        data: [],
        message:
          "Kafka broker not available on localhost:9092. Please start your Kafka producer.",
        broker: "localhost:9092 (offline)",
      });
    } finally {
      // Always disconnect the consumer
      try {
        await consumer.disconnect();
      } catch (disconnectError) {
        console.error("Error disconnecting consumer:", disconnectError);
      }
    }

    return NextResponse.json({
      success: true,
      data: messages,
      message: `Retrieved ${messages.length} transactions from Kafka`,
      broker: "localhost:9092",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch transaction data",
        broker: "localhost:9092",
      },
      { status: 500 }
    );
  }
}

// POST endpoint for future Kafka consumer control
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "start":
        // Future: Start Kafka consumer
        return NextResponse.json({
          success: true,
          message: "Kafka consumer start requested - not implemented yet",
        });

      case "stop":
        // Future: Stop Kafka consumer
        return NextResponse.json({
          success: true,
          message: "Kafka consumer stop requested - not implemented yet",
        });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}
