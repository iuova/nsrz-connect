import React, { useState, useEffect } from 'react';
import { getNews, deleteNews, publishNews } from '../api/newsApi';
import { getUsers, deleteUser } from '../api/usersApi';
import NewsEditor from '../components/NewsEditor';
import UsersEditor from '../components/UsersEditor';
import { useAuth } from '../context/AuthContext';
import './AdminPanel.css';

const AdminPanel = () => {
  const [news, setNews] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingNews, setEditingNews] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [activeTab, setActiveTab] = useState('news');
  const { user, isAdmin } = useAuth(); // Используем метод isAdmin

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

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (isAdmin()) { // Используем метод isAdmin для проверки
      loadNews();
      loadUsers();
    }
  }, [isAdmin]);

  const handleDeleteNews = async (id) => {
    if (!isAdmin()) return; // Используем метод isAdmin для проверки
    try {
      await deleteNews(id);
      setNews(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePublishNews = async (id) => {
    if (!isAdmin()) return; // Используем метод isAdmin для проверки
    try {
      await publishNews(id);
      setNews(prev => prev.map(item => 
        item.id === id ? { ...item, published: !item.published } : item
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!isAdmin()) return; // Используем метод isAdmin для проверки
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNews = news.slice(indexOfFirstItem, indexOfLastItem);
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (!isAdmin()) return <div className="error">Доступ запрещен</div>; // Используем метод isAdmin для проверки
  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <div className="admin-container">
      <h1>Панель администратора</h1>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'news' ? 'active' : ''}`}
          onClick={() => setActiveTab('news')}
        >
          Управление новостями
        </button>
        <button
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Управление пользователями
        </button>
      </div>

      {activeTab === 'news' && (
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
              {currentNews.map(item => (
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

          <div className="pagination">
            {Array.from({ length: Math.ceil(news.length / itemsPerPage) }, (_, i) => (
              <button key={i + 1} onClick={() => paginate(i + 1)}>
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <>
          <button 
            onClick={() => setEditingUser({ lastname: '', firstname: '', midlename: '', role: '', status: '', department: '' })}
            className="btn-add"
          >
            + Добавить пользователя
          </button>

          {editingUser && (
            <UsersEditor
              user={editingUser}
              onSave={() => {
                setEditingUser(null);
                loadUsers();
              }}
              onCancel={() => setEditingUser(null)}
            />
          )}

          <table className="users-table">
            <thead>
              <tr>
                <th>Фамилия</th>
                <th>Имя</th>
                <th>Отчество</th>
                <th>Роль</th>
                <th>Статус</th>
                <th>Отдел</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.lastname}</td>
                  <td>{user.firstname}</td>
                  <td>{user.midlename}</td>
                  <td>{user.role}</td>
                  <td>{user.status}</td>
                  <td>{user.department}</td>
                  <td>
                    <button 
                      onClick={() => setEditingUser(user)}
                      className="btn-edit"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="btn-delete"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            {Array.from({ length: Math.ceil(users.length / itemsPerPage) }, (_, i) => (
              <button key={i + 1} onClick={() => paginate(i + 1)}>
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPanel;