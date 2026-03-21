import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'orders-tracking-app',
  brokers: ['localhost:9092'], // replace with your Kafka broker address
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'orders-tracking-group' });

export { producer, consumer };
