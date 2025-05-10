import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './NewsTab.css';
import NewsEditor from '../../components/NewsEditor';
import { formatDate } from '../../utils/dateUtils';

const NewsTab = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const limit = 10; // количество новостей на странице

  // Функция для загрузки новостей с сервера
  const loadNews = useCallback(async (page = 1, query = '') => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/news`, {
        params: {
          page,
          limit,
          search: query
        }
      });
      
      setNews(response.data.news || []);
      setTotalPages(Math.ceil((response.data.total || 0) / limit));
      setCurrentPage(page);
    } catch (err) {
      console.error('Error loading news:', err);
      setError('Не удалось загрузить новости');
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузка новостей при первом рендере и при изменении страницы или поискового запроса
  useEffect(() => {
    loadNews(currentPage, searchQuery);
  }, [loadNews, currentPage, searchQuery]);

  // Открытие редактора для создания новой новости
  const handleCreateNews = () => {
    setEditingNewsId(null);
    setIsEditorOpen(true);
  };

  // Открытие редактора для редактирования существующей новости
  const handleEditNews = (newsId) => {
    setEditingNewsId(newsId);
    setIsEditorOpen(true);
  };

  // Обработчик поиска новостей
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // сброс на первую страницу при новом поиске
    loadNews(1, searchQuery);
  };

  // Изменение статуса публикации новости
  const togglePublishStatus = async (newsId, currentStatus) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/news/${newsId}/publish`, 
        { published: !currentStatus }
      );
      
      // Обновление списка новостей после изменения статуса
      setNews(news.map(item => 
        item.id === newsId ? { ...item, published: response.data.published } : item
      ));
    } catch (err) {
      console.error('Error updating publish status:', err);
      setError('Не удалось изменить статус публикации');
    }
  };

  // Подтверждение удаления новости
  const confirmDelete = (newsId) => {
    setConfirmDeleteId(newsId);
  };

  // Отмена удаления
  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  // Удаление новости
  const deleteNews = async (newsId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/news/${newsId}`);
      // Обновляем список новостей после удаления
      setNews(news.filter(item => item.id !== newsId));
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Error deleting news:', err);
      setError('Не удалось удалить новость');
    }
  };

  // Обработчик создания/редактирования новости
  const handleNewsCreated = () => {
    loadNews(currentPage, searchQuery);
  };

  // Переход на предыдущую страницу
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Переход на следующую страницу
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Функция для форматирования даты
  const formatDateString = (dateString) => {
    if (!dateString) return 'Нет данных';
    return formatDate(new Date(dateString));
  };

  // Получение имени автора (если есть)
  const getAuthorName = (authorId, email) => {
    if (!authorId) return 'Не указан';
    return email || `ID: ${authorId}`;
  };

  return (
    <div className="news-admin-tab">
      <div className="admin-panel-header">
        <h2>Управление новостями</h2>
        <button className="create-btn" onClick={handleCreateNews}>
          Создать новость
        </button>
      </div>

      {/* Поиск новостей */}
      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск по заголовку..."
          className="search-input"
        />
        <button type="submit" className="search-btn">Поиск</button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Загрузка новостей...</div>
      ) : news.length === 0 ? (
        <div className="no-news">Новости не найдены</div>
      ) : (
        <>
          <div className="news-table-container">
            <table className="news-table">
              <thead>
                <tr>
                  <th className="col-id">ID</th>
                  <th className="col-title">Заголовок</th>
                  <th className="col-author">Автор</th>
                  <th className="col-date">Дата создания</th>
                  <th className="col-status">Статус</th>
                  <th className="col-actions">Действия</th>
                </tr>
              </thead>
              <tbody>
                {news.map(item => (
                  <tr key={item.id} className={item.published ? 'published' : 'unpublished'}>
                    <td>{item.id}</td>
                    <td className="news-title-cell">{item.title}</td>
                    <td>{getAuthorName(item.author_id, item.author_email)}</td>
                    <td>{formatDateString(item.created_at)}</td>
                    <td>
                      <span 
                        className={`status-badge ${item.published ? 'published' : 'unpublished'}`}
                        onClick={() => togglePublishStatus(item.id, item.published)}
                      >
                        {item.published ? 'Опубликовано' : 'Черновик'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="edit-btn"
                          onClick={() => handleEditNews(item.id)}
                          title="Редактировать"
                        >
                          ✎
                        </button>
                        
                        {confirmDeleteId === item.id ? (
                          <div className="confirm-delete">
                            <button 
                              className="confirm-yes" 
                              onClick={() => deleteNews(item.id)}
                              title="Подтвердить удаление"
                            >
                              ✓
                            </button>
                            <button 
                              className="confirm-no" 
                              onClick={cancelDelete}
                              title="Отменить удаление"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="delete-btn"
                            onClick={() => confirmDelete(item.id)}
                            title="Удалить"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        </>
      )}

      {/* Редактор новостей */}
      {isEditorOpen && (
        <NewsEditor
          newsId={editingNewsId}
          onClose={() => setIsEditorOpen(false)}
          onNewsCreated={handleNewsCreated}
        />
      )}
    </div>
  );
};

export default NewsTab;