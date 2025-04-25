import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get('/api/news?published=true');
        setNews(response.data);
      } catch (error) {
        console.error('Ошибка загрузки новостей:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <h1>Добро пожаловать в НСРЗ Коннект</h1>
        <p>Корпоративный портал АО "НСРЗ"</p>
      </section>

      <section className="cards-section">
        <div className="cards-grid">
          <Link to="/news" className="card">
            <div className="card-content">
              <h3>Новости</h3>
              <p>Актуальные события и объявления</p>
            </div>
          </Link>
          <Link to="/structure" className="card">
            <div className="card-content">
              <h3>Структура</h3>
              <p>Организационная структура предприятия</p>
            </div>
          </Link>
          <Link to="/phonebook" className="card">
            <div className="card-content">
              <h3>Справочник</h3>
              <p>Контакты сотрудников</p>
            </div>
          </Link>
          <Link to="/resources" className="card">
            <div className="card-content">
              <h3>Ресурсы</h3>
              <p>Информация об отпусках</p>
            </div>
          </Link>
        </div>
      </section>

      <section className="latest-news">
        <h2>Последние новости</h2>
        {loading ? (
          <p>Загрузка новостей...</p>
        ) : (
          <div className="news-list">
            {news.map(item => (
              <div key={item.id} className="news-item">
                <h3>{item.title}</h3>
                <p>{item.content}</p>
                <div className="news-meta">
                  <span className="news-date">{new Date(item.date).toLocaleDateString()}</span>
                  <span className="news-author">{item.author}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <Link to="/news" className="view-all-news">
          Все новости →
        </Link>
      </section>
    </div>
  );
};

export default Home; 