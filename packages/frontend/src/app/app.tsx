import { useState } from 'react';
import RealtimeDashboard from './components/RealtimeDashboard';

export function App() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  const sendMessage = async () => {
    if (!message) return;

    try {
      const res = await fetch('http://localhost:3333/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const text = await res.text();
      setResponse(text);
      setMessage('');
    } catch (err) {
      console.error(err);
      setResponse('Failed to send message');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ padding: 20 }}>
        <h1>Hello World from React frontend!</h1>
        <p>Send a message to Kafka via Node backend:</p>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message"
          style={{ width: 300, marginRight: 8 }}
        />
        <button onClick={sendMessage}>Send</button>

        {response && <p style={{ margin: 10 }}>{response}</p>}
      </div>

      <RealtimeDashboard />
    </div>
  );
}

export default App;
