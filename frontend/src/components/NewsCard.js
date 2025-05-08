import React from 'react';
import styles from '../styles/newsStyles.module.css';
import { Link } from 'react-router-dom';

const NewsCard = ({ newsItem, showFullContent = false }) => {
  return (
    <div className={styles.newsCard}>
      <h3 className={styles.newsTitle}>{newsItem.title}</h3>
      <div className={styles.newsContent}>
        {showFullContent 
          ? newsItem.content 
          : `${newsItem.content.substring(0, 100)}${newsItem.content.length > 100 ? '...' : ''}`
        }
      </div>
      <div className={styles.newsMeta}>
        <span>{new Date(newsItem.createdAt).toLocaleDateString()}</span>
        <span>{newsItem.author || 'Администратор'}</span>
      </div>
    </div>
  );
};

export default NewsCard; 