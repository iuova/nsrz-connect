import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [publishedNews, setPublishedNews] = useState([]);

  useEffect(() => {
    // Загрузка только опубликованных новостей с сервера
    const fetchPublishedNews = async () => {
      try {
        const response = await axios.get('/api/news?published=true');
        setPublishedNews(response.data);
      } catch (error) {
        console.error('Ошибка загрузки новостей:', error);
      }
    };

    fetchPublishedNews();
  }, []);

  return (
    <div className="home-page">
      <section className="hero">
        <h1>Новости компании</h1>
        <p>Актуальные события и обновления</p>
      </section>

      <div className="news-container">
        {publishedNews.length > 0 ? (
          publishedNews.map(newsItem => (
            <div key={newsItem.id} className="news-card">
              <h2>{newsItem.title}</h2>
              <div 
                className="news-content" 
                dangerouslySetInnerHTML={{ __html: newsItem.content }} 
              />
              <div className="news-meta">
                <span>{new Date(newsItem.date).toLocaleDateString()}</span>
                <span>{newsItem.author}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="no-news">На данный момент нет опубликованных новостей</p>
        )}
      </div>
    </div>
  );
};

export default Home; 