import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './News.css';

if (!process.env.REACT_APP_API_URL) {
  throw new Error('REACT_APP_API_URL env variable is not set');
}
const API_BASE = process.env.REACT_APP_API_URL;

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Количество новостей на странице

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/news`);
        if (response.data && response.data.length > 0) {
          setNews(response.data);
        } else {
          setError('Новостей пока нет.');
        }
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Не удалось загрузить новости');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Пагинация
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNews = news.slice(indexOfFirstItem, indexOfLastItem);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="app">
        <Navbar />
        <div className="main-content">
          <div className="loading">Загрузка новостей...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <Navbar />
        <div className="main-content">
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar />
      <div className="main-content">
        <div className="news-container">
          <section className="hero">
            <h1>Новости предприятия</h1>
            <p>Актуальные события и объявления</p>
          </section>
          <div className="news-list">
            {currentNews.map(item => (
              <div key={item.id} className="news-item">
                <h2>{item.title}</h2>
                <p className="news-content">{item.content}</p>
                <div className="news-meta">
                  <span className="news-date">{item.date || item.createdAt?.slice(0,10)}</span>
                  <span className="news-author">{item.author || 'Администратор'}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Пагинация */}
          <div className="pagination">
            {Array.from({ length: Math.ceil(news.length / itemsPerPage) }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={currentPage === i + 1 ? 'active' : ''}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default News; 
