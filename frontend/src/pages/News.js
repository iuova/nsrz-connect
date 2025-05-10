import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './News.css';
import { formatDate, getRelativeTime } from '../utils/dateUtils';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(5); // Количество новостей на странице

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/news`, {
          params: {
            page: currentPage,
            limit
          }
        });
        
        if (response.data && response.data.news && response.data.news.length > 0) {
          setNews(response.data.news);
          setTotalPages(Math.ceil(response.data.total / limit));
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
  }, [currentPage, limit]);

  // Обработчики пагинации
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Получение имени автора (если есть)
  const getAuthorName = (authorId, email) => {
    if (!authorId) return 'Администратор';
    return email || `Пользователь ID: ${authorId}`;
  };

  // Обработка даты публикации
  const getPublicationDate = (publishDate, createdAt) => {
    const date = publishDate || createdAt;
    if (!date) return 'Без даты';
    
    return getRelativeTime(new Date(date));
  };

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
            {news.map(item => (
              <div key={item.id} className="news-item">
                <h2>{item.title}</h2>
                
                {item.image && (
                  <div className="news-image">
                    <img 
                      src={`${API_BASE}/uploads/${item.image}`} 
                      alt={item.title} 
                    />
                  </div>
                )}
                
                <div 
                  className="news-content"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                ></div>
                
                <div className="news-meta">
                  <span className="news-date">
                    {getPublicationDate(item.publish_date, item.created_at)}
                  </span>
                  <span className="news-author">
                    {getAuthorName(item.author_id, item.author_email)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={goToPreviousPage} 
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                &lt; Назад
              </button>
              <span className="page-info">
                Страница {currentPage} из {totalPages}
              </span>
              <button 
                onClick={goToNextPage} 
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Вперед &gt;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default News; 
