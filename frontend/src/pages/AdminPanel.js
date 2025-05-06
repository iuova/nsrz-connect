import React, { useState, useEffect } from 'react';
import { getNews, deleteNews, publishNews } from '../api/newsApi';
import NewsEditor from '../components/NewsEditor';
import './AdminPanel.css';

const AdminPanel = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingNews, setEditingNews] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // 5 новостей на странице

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
    loadNews();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteNews(id);
      setNews(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePublish = async (id) => {
    try {
      await publishNews(id);
      setNews(prev => prev.map(item => 
        item.id === id ? { ...item, published: !item.published } : item
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  // Логика для пагинации
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = news.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <div className="loading">Loading news...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="admin-container">
      <h1>Управление новостями</h1>
      
      <button 
        onClick={() => setEditingNews({ title: '', content: '' })}
        className="btn-add"
        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
      >
        + Добавить
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
                  Edit
                </button>
                <button
                  onClick={() => handlePublish(item.id)}
                  className={`btn-publish ${item.published ? 'published' : ''}`}
                >
                  {item.published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="btn-delete"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        {Array.from({ length: Math.ceil(news.length / itemsPerPage) }, (_, i) => (
          <button key={i + 1} onClick={() => paginate(i + 1)}>
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel; 