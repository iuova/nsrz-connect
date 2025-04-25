import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './NewsPage.css';

const NewsPage = () => {
  const [publishedNews, setPublishedNews] = useState([]);

  useEffect(() => {
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
    <div className="news-page">
      <h1>Новости компании</h1>
      
      <div className="news-list">
        {publishedNews.map(news => (
          <article key={news.id} className="news-article">
            <h2>{news.title}</h2>
            <div className="news-meta">
              <span>{new Date(news.date).toLocaleDateString()}</span>
              <span>{news.author}</span>
            </div>
            <div 
              className="news-content" 
              dangerouslySetInnerHTML={{ __html: news.content }} 
            />
          </article>
        ))}
      </div>
    </div>
  );
}; 