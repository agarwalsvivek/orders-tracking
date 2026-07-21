/* eslint-disable @typescript-eslint/ban-ts-comment */
/* This is Debounce Search example */

import { useState } from 'react';
import './search.css';

// @ts-expect-error
const debounce = (func, delay = 400) => {
  // @ts-expect-error
  let timeout;

  // @ts-expect-error
  return function (...args) {
    // @ts-expect-error
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      func(args);
    }, delay);
  };
};

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async (query: string) => {
    setLoading(true);
    const res = await fetch(
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    setResults(data.hits);
    setLoading(false);
  };

  const debouncedSearch = debounce(fetchData);

  return (
    <div className="container">
      <h1>HN Search (Debounce Search)</h1>
      <input
        style={{ width: '200px', padding: 8, fontSize: 16 }}
        type="text"
        value={query}
        placeholder="Search Hacker News..."
        onChange={({ target }) => {
          setQuery(target.value);
          setResults([]);
          debouncedSearch(target.value);
        }}
      />
      {loading && <p>loading...</p>}
      <section>
        {results.map((result) => {
          return (
            <div className="hit" key={result.objectID}>
              <span>
                <a href={result.url} target="_blank" rel="noreferrer">
                  {result.title}
                </a>
                - {result.author}:{new Date(result.created_at).toLocaleString()}
              </span>
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default Search;
