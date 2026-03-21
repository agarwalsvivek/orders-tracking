import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'hello-world-app',
  brokers: ['localhost:9092'], // replace with your Kafka broker address
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: 'hello-world-group' });
