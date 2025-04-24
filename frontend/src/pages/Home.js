import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [latestNews, setLatestNews] = useState([]);

  useEffect(() => {
    // Временные данные для новостей
    const mockNews = [
      {
        id: 1,
        title: 'Обновление системы НСРЗ Коннект',
        content: 'Запущена новая версия корпоративного портала',
        date: '20.03.2024',
        author: 'Администратор'
      },
      {
        id: 2,
        title: 'Корпоративное собрание',
        content: 'Приглашаем всех сотрудников на ежегодное собрание',
        date: '18.03.2024',
        author: 'Отдел кадров'
      },
      // Добавьте еще 3 новости для примера
    ].slice(0, 5); // Ограничиваем до 5 последних новостей

    setLatestNews(mockNews);
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
        <div className="news-list">
          {latestNews.map(news => (
            <div key={news.id} className="news-item">
              <h3>{news.title}</h3>
              <p>{news.content}</p>
              <div className="news-meta">
                <span className="news-date">{news.date}</span>
                <span className="news-author">{news.author}</span>
              </div>
            </div>
          ))}
        </div>
        <Link to="/news" className="view-all-news">
          Все новости →
        </Link>
      </section>
    </div>
  );
};

export default Home; 