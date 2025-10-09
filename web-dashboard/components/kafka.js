import { Kafka } from "kafkajs";

const kafka = new Kafka({ brokers: ["localhost:9092"] });
const consumer = kafka.consumer({ groupId: "test-group" });

await consumer.connect();
await consumer.subscribe({ topic: "test-topic", fromBeginning: true });
await consumer.run({
  eachMessage: async ({ topic, message }) => {
    console.log(`Received: ${message.value.toString()}`);
  },
});
export default consumer;
