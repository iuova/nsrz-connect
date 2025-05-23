import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import './News.css';

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Временные данные для новостей
    const mockNews = [
      {
        id: 1,
        title: 'Обновление системы',
        content: 'Запущена новая версия корпоративного портала НСРЗ Коннект',
        date: '2024-03-20',
        author: 'Администратор'
      },
      {
        id: 2,
        title: 'Корпоративное мероприятие',
        content: 'Приглашаем всех сотрудников на ежегодное собрание',
        date: '2024-03-18',
        author: 'Отдел кадров'
      }
    ];

    // Имитация загрузки данных
    setTimeout(() => {
      setNews(mockNews);
      setLoading(false);
    }, 1000);
  }, []);

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
            {news.map(item => (
              <div key={item.id} className="news-item">
                <h2>{item.title}</h2>
                <p className="news-content">{item.content}</p>
                <div className="news-meta">
                  <span className="news-date">{item.date}</span>
                  <span className="news-author">{item.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default News; 