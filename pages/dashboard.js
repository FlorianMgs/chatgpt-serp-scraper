import { useState } from 'react';
import axios from 'axios';
import cheerio from 'cheerio';
import styles from '../styles/Dashboard.module.scss';

const countryOptions = [
  { label: 'United States', value: 'us' },
  { label: 'United Kingdom', value: 'uk' },
  { label: 'Canada', value: 'ca' },
  { label: 'Australia', value: 'au' },
  { label: 'France', value: 'fr' },
  { label: 'Germany', value: 'de' },
  { label: 'Spain', value: 'es' },
  { label: 'Italy', value: 'it' },
];

const Dashboard = () => {
  const [keyword, setKeyword] = useState('');
  const [country, setCountry] = useState(countryOptions[0].value);
  const [searchResults, setSearchResults] = useState([]);
  const [relatedKeywords, setRelatedKeywords] = useState([]);

  const handleSearch = async () => {
    try {
      const res = await axios.get(`http://localhost:${process.env.PORT || 8080}/https://www.google.com/search?q=${encodeURIComponent(keyword)}&gl=${encodeURIComponent(country)}`);

      const results = [];
      const html = res.data;
      const $ = cheerio.load(html);

      $('div.g').each((i, el) => {
        const title = $(el).find('h3').text().trim();
        const url = $(el).find('a').attr('href');
        results.push({ title, url });
      });

      const relatedKeywords = getRelatedKeywords(res);
      setSearchResults(results);
      setRelatedKeywords(relatedKeywords);
    } catch (err) {

      console.error(err);
    }
};

const getRelatedKeywords = (res) => {
  const html = res.data;
  const $ = cheerio.load(html);

  const relatedKeywords = [];
  let counter = 0;
  $('div').each((i, el) => {
    const text = $(el).text().trim().toLowerCase();
    if (text.includes(keyword.toLowerCase()) && text.split(' ').length >= 2 && counter < 30) {
      const relatedKeyword = text.replace(/[^\w\s]/gi, '');
      if (!relatedKeywords.includes(relatedKeyword)) {
        relatedKeywords.push(relatedKeyword);
        counter++;
      }
    }
  });

  return relatedKeywords;
};
return (
<div className={styles.container}>
<h1>Keyword Ranking Dashboard</h1>
  <div className={styles.form}>
    <label htmlFor="keyword">Enter a keyword:</label>
    <input type="text" id="keyword" value={keyword} onChange={e => setKeyword(e.target.value)} />

    <label htmlFor="country">Select a country:</label>
    <select id="country" value={country} onChange={e => setCountry(e.target.value)}>
      {countryOptions.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>

    <button onClick={handleSearch}>Search</button>
  </div>

  {searchResults.length > 0 && (
    <div className={`${styles.table} my-table`}>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>URL</th>
            <th>Position</th>
          </tr>
        </thead>
        <tbody>
          {searchResults.map((result, index) => (
            <tr key={index}>
              <td>{result.title}</td>
              <td><a href={result.url}>{result.url}</a></td>
              <td>{index+1}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}

  {relatedKeywords.length > 0 && (
    <div className={styles.relatedKeywords}>
      <h2>Related Keywords:</h2>
      <ul>
        {relatedKeywords.map((keyword, index) => (
          <li key={index}>{keyword}</li>
        ))}
      </ul>
    </div>
  )}
</div>
);
};

export default Dashboard;