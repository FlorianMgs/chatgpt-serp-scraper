import { useState } from 'react';
import axios from 'axios';
import cheerio from 'cheerio';
import styles from '../styles/Dashboard.module.scss';

const countryOptions = [
  { label: 'US', value: 'us' },
  { label: 'UK', value: 'uk' },
  { label: 'CA', value: 'ca' },
  { label: 'AU', value: 'au' },
  { label: 'FR', value: 'fr' },
  { label: 'DE', value: 'de' },
  { label: 'ES', value: 'es' },
  { label: 'IT', value: 'it' },
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
      console.log(results)
      setRelatedKeywords(relatedKeywords);
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeywordClick = (clickedKeyword) => {
    setKeyword(clickedKeyword);
    handleSearch();
  };

  const getRelatedKeywords = (res) => {
    const html = res.data;
    const $ = cheerio.load(html);
    const relatedKeywords = [];

    $('div').each((i, el) => {
      const text = $(el).text().trim();
      const regex = new RegExp(`(${keyword}\\s+\\w+\\s+\\w+|\\w+\\s+${keyword}\\s+\\w+|\\w+\\s+\\w+\\s+${keyword})`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        matches.forEach((match) => {
          const relatedKeyword = match.replace(/\b\w{1,2}\b/g, '').replace(/\s{2,}/g, ' ').trim();
          if (relatedKeyword.toLowerCase() !== keyword.toLowerCase() && !relatedKeywords.includes(relatedKeyword.toLowerCase()) && relatedKeywords.length < 30) {
            relatedKeywords.push(relatedKeyword.toLowerCase());
          }
        });
      }
    });

    return relatedKeywords;
  };

  return (
    <div className={styles.container}>
      <h1>Keyword Ranking Dashboard</h1>
      <div className={styles.form}>
        <input
          type="text"
          id="keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Keyword..."
        />
        <select id="country" value={country} onChange={(e) => setCountry(e.target.value)}>
          {countryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
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
                  <td>
                    <a href={result.url}>{result.url}</a>
                  </td>
                  <td>{index + 1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
  
      {relatedKeywords.length > 0 && (
        <div className={styles.relatedKeywords}>
          <h2>Related Keywords:</h2>
          <div className={styles.keywordLists}>
            <div className={styles.keywordList}>
              {relatedKeywords.slice(0, 10).map((relatedKeyword, index) => (
                <button key={index} onClick={() => handleKeywordClick(relatedKeyword)}>
                  {relatedKeyword}
                </button>
              ))}
            </div>
            <div className={styles.keywordList}>
              {relatedKeywords.slice(10, 20).map((relatedKeyword, index) => (
                <button key={index} onClick={() => handleKeywordClick(relatedKeyword)}>
                  {relatedKeyword}
                </button>
              ))}
            </div>
            <div className={styles.keywordList}>
              {relatedKeywords.slice(20, 30).map((relatedKeyword, index) => (
                <button key={index} onClick={() => handleKeywordClick(relatedKeyword)}>
                  {relatedKeyword}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};  

export default Dashboard;       