/* eslint-disable @typescript-eslint/no-unused-vars */
import express from 'express';
import { producer, consumer } from './kafka/kafka';
import cors from 'cors';

const app = express();
const port = 3333;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World from Node backend!');
});

app.listen(port, () => {
  console.log(`Backend is running at http://localhost:${port}`);
});

// Endpoint to send message
app.post('/send', async (req, res) => {
  const { message } = req.body;
  try {
    await producer.connect();
    await producer.send({
      topic: 'test-topic',
      messages: [{ value: message }],
    });
    res.send(`Message sent: ${message}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to send message');
  }
});

// Start consumer
async function startConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'test-topic', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      //console.log(`Received message: ${message.value?.toString()}`);
      console.log(`Received message: ${message}`);
    },
  });
}

startConsumer().catch(console.error);
