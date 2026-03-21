import { useEffect, useState } from 'react';

export function App() {
  const [data, setData] = useState('');

  useEffect(() => {
    fetch('http://localhost:3333/')
      .then((response) => response.text())
      .then((text) => setData(text))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  return (
    <div>
      <h1>Hello World from React frontend!</h1>
      <p>This is a TypeScript React app inside NX monorepo.</p>
      <strong>Data from backend....</strong>
      <p>{data}</p>
    </div>
  );
}

export default App;
