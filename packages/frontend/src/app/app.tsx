import { useState } from 'react';
//import RealtimeDashboard from './components/RealtimeDashboard';

import './app.css';
import Search from './components/search-debounce/Search';
import SearchDropdown from './components/search-debounce/SearchDropdown';

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
    <div className="container">
      <div className="kafka-container">
        <p>Hello World. Send a message to Kafka via Node backend:</p>

        {/* This is kafka example */}
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

      <div className="searchbar">
        <Search />
        <SearchDropdown />
      </div>

      {/* <RealtimeDashboard /> */}
    </div>
  );
}

export default App;
