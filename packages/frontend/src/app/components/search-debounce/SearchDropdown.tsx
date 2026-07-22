/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useState } from 'react';
import './search.css';

/**
 * ==> 1. capture input
 * ==> 2. fetch data
 * 3. display data
 * 4. allow data selection
 * ==> 5. add debounce
 */
const URL = 'https://hn.algolia.com/api/v1/search?query';

const debounce = (func: any, wait = 400) => {
  // @ts-expect-error
  let timeout;

  return function (...args: any) {
    // @ts-expect-error
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      func(args);
    }, wait);
  };
};

const SearchDropdown = () => {
  const [search, setSearch] = useState('');
  const [result, setResult] = useState([]);
  //const [focus, setFocus] = useState(false);

  const fetchData = async (query: string) => {
    const response = await fetch(`${URL}=${encodeURIComponent(query)}`);
    console.log(search, result);
    if (!response.ok) throw new Error('fetch Error');

    const data = await response.json();
    setResult(data.hits);
  };

  //console.log(`focus: ${focus}`);

  const debounceSearch = debounce(fetchData);

  const onChange = ({ target }: any) => {
    const value = target.value;
    setSearch(value);
    setResult([]);
    debounceSearch(value);
  };

  return (
    <div className="container">
      <h1>Search Dropdown</h1>
      <input
        type="text"
        placeholder="Search..."
        onChange={onChange}
        onClick={() => {
          //setFocus(true);
          ///console.log(focus);
        }}
      />
      <select className="options">
        {result.map((item: any) => (
          <option key={item.objectID}>{item.author}</option>
        ))}
      </select>
    </div>
  );
};

export default SearchDropdown;
