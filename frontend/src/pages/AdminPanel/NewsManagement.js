import { useState, useEffect } from 'react';
import { fetchNews, createNews, updateNews, deleteNews, togglePublish } from '../../api/newsApi';

export default function NewsManagement() {
  const [news, setNews] = useState([]); // Важно: инициализировать массивом
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const data = await fetchNews();
        setNews(Array.isArray(data) ? data : []); // Защита от не-массивов
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadNews();
  }, []);

  const handleCreate = async () => {
    try {
      const newNews = await createNews({
        title: 'Новая новость',
        content: 'Содержание новости'
      });
      setNews([newNews, ...news]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (id) => {
    try {
      await updateNews(id, {
        title: 'Обновленный заголовок',
        content: 'Обновленное содержание'
      });
      setNews(news.map(item => item.id === id ? {...item, title: 'Updated'} : item));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNews(id);
      setNews(news.filter(item => item.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTogglePublish = async (id, currentPublished) => {
    try {
      await togglePublish(id, !currentPublished);
      setNews(news.map(item => 
        item.id === id ? {...item, published: !currentPublished} : item
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={handleCreate}>Создать новость</button>
      
      {news.map(item => (
        <div key={item.id}>
          <h3>{item.title}</h3>
          <button onClick={() => handleUpdate(item.id)}>Редактировать</button>
          <button onClick={() => handleDelete(item.id)}>Удалить</button>
          <button onClick={() => handleTogglePublish(item.id, item.published)}>
            {item.published ? 'Снять с публикации' : 'Опубликовать'}
          </button>
        </div>
      ))}
    </div>
  );
} 