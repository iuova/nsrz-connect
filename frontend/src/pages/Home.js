import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLatestNews } from '../api/newsApi';
import './Home.css';

const Home = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getLatestNews();
        setNews(data);
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
          <div className="news-grid">
            {news.map(item => (
              <div key={item.id} className="news-card">
                <h3>{item.title}</h3>
                <div className="news-content">
                  <p>{item.content.length > 100 ? `${item.content.substring(0, 100)}...` : item.content}</p>
                </div>
                <div className="news-meta">
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <Link to="/news" className="view-all">Все новости →</Link>
      </section>
    </div>
  );
};

export default Home; 