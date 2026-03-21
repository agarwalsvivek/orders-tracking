import express from 'express';
import cors from 'cors';

const app = express();
const port = 3333;

app.use(cors({ origin: '*' }));

app.get('/', (req, res) => {
  res.send('Hello World from Node backend!');
});

app.listen(port, () => {
  console.log(`Backend is running at http://localhost:${port}`);
});
