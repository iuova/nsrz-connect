import React, { useState, useEffect } from 'react';
import { getNews, deleteNews, publishNews } from '../api/newsApi';
import NewsEditor from './NewsEditor';
import Pagination from './Pagination';
import '../pages/AdminPanel.css';

const NewsManagement = ({ isAdmin }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingNews, setEditingNews] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const loadNews = async () => {
    try {
      const data = await getNews();
      setNews(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadNews();
  }, [isAdmin]);

  const handleDeleteNews = async (id) => {
    if (!isAdmin) return;
    try {
      await deleteNews(id);
      setNews(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePublishNews = async (id) => {
    if (!isAdmin) return;
    try {
      await publishNews(id);
      setNews(prev => prev.map(item => 
        item.id === id ? { ...item, published: !item.published } : item
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = news.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <>
      <button 
        onClick={() => setEditingNews({ title: '', content: '' })}
        className="btn-add"
      >
        + Добавить новость
      </button>

      {editingNews && (
        <NewsEditor
          news={editingNews}
          onSave={() => {
            setEditingNews(null);
            loadNews();
          }}
          onCancel={() => setEditingNews(null)}
        />
      )}

      <table className="news-table">
        <thead>
          <tr>
            <th>Заголовок</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map(item => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>
                <button 
                  onClick={() => setEditingNews(item)}
                  className="btn-edit"
                >
                  Редактировать
                </button>
                <button
                  onClick={() => handlePublishNews(item.id)}
                  className={`btn-publish ${item.published ? 'published' : ''}`}
                >
                  {item.published ? 'Снять с публикации' : 'Опубликовать'}
                </button>
                <button
                  onClick={() => handleDeleteNews(item.id)}
                  className="btn-delete"
                >
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        totalItems={news.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </>
  );
};

export default NewsManagement; 