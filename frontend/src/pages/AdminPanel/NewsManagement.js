import { useState, useEffect } from 'react';
import { fetchNews, createNews, updateNews, deleteNews, togglePublish } from '../../api/newsApi';
import './AdminPanel.css'; // Используем стили из AdminPanel.css

export default function NewsManagement() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // 5 новостей на странице

  useEffect(() => {
    const loadNews = async () => {
      try {
        const data = await fetchNews();
        setNews(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadNews();
  }, []);

  // Логика для пагинации
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = news.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
      <h1>Управление новостями</h1>
      <button onClick={handleCreate}>Создать новость</button>

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
                <button onClick={() => handleUpdate(item.id)}>Редактировать</button>
                <button onClick={() => handleDelete(item.id)}>Удалить</button>
                <button onClick={() => handleTogglePublish(item.id, item.published)}>
                  {item.published ? 'Снять с публикации' : 'Опубликовать'}
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
} 