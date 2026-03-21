import express from 'express';
import cors from 'cors';
import { KafkaMessage } from 'kafkajs';
import { producer, consumer } from './kafka';

const app = express();
const port = 3334; // different port

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Kafka Service is running!');
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
    res.send(`[kafka]: ${message}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to send message');
  }
});

app.listen(port, () => {
  console.log(`Kafka Service is running at http://localhost:${port}`);
});

// Start consumer
async function startConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'test-topic', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      topic,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      partition,
      message,
    }: {
      topic: string;
      partition: number;
      message: KafkaMessage;
    }) => {
      // console.log(
      //   `Received topic: ${topic}, partition: ${partition} message: ${message.value?.toString()}`
      // );
      console.log(`Received message: ${message}`);
    },
  });
}

startConsumer().catch(console.error);
