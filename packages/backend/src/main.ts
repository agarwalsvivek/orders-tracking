/* eslint-disable @typescript-eslint/no-unused-vars */
import express from 'express';
import axios from 'axios';
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
  console.log(`Received [BE]: ${JSON.stringify(message)}`);
  try {
    const response = await axios.post('http://localhost:3334/send', {
      message,
    });
    console.log(`Sending [BE]: ${JSON.stringify(response.data)}`);
    res.send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to send message');
  }
});
