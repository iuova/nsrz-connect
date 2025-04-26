import React, { useState, useEffect } from 'react';
import { getNews, deleteNews, publishNews } from '../api/newsApi';
import NewsEditor from '../components/NewsEditor';
import './AdminPanel.css';

const AdminPanel = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingNews, setEditingNews] = useState(null);

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

  if (loading) return <div className="loading">Loading news...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="admin-container">
      <h1>News Management</h1>
      
      <button 
        onClick={() => setEditingNews({ title: '', content: '' })}
        className="btn-add"
      >
        + Add New Article
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

      <div className="news-grid">
        {news.map(item => (
          <article key={item.id} className="news-card">
            <h3>{item.title}</h3>
            <div 
              className="content-preview" 
              dangerouslySetInnerHTML={{ __html: item.content.substring(0, 150) + '...' }} 
            />
            <div className="card-actions">
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
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel; 