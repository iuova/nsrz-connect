import React, { useState } from 'react';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="admin-panel">
      <section className="hero">
        <h1>Панель администратора</h1>
        <p>Управление пользователями и контентом</p>
      </section>
      
      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Пользователи
        </button>
        <button 
          className={`tab-button ${activeTab === 'news' ? 'active' : ''}`}
          onClick={() => setActiveTab('news')}
        >
          Новости
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'users' ? <UserManagement /> : <NewsManagement />}
      </div>
    </div>
  );
};

// Компонент управления пользователями
const UserManagement = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'Администратор', email: 'admin@nsrz.ru', role: 'admin' },
    { id: 2, name: 'Сотрудник', email: 'user@nsrz.ru', role: 'employee' }
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'employee' });

  const handleAddUser = (e) => {
    e.preventDefault();
    setUsers([...users, { ...newUser, id: users.length + 1 }]);
    setNewUser({ name: '', email: '', password: '', role: 'employee' });
    setShowAddForm(false);
  };

  return (
    <div className="user-management">
      <div className="section-header">
        <h2>Управление пользователями</h2>
        <button className="add-button" onClick={() => setShowAddForm(true)}>
          Добавить пользователя
        </button>
      </div>

      {showAddForm && (
        <div className="add-form-container">
          <form onSubmit={handleAddUser} className="add-form">
            <h3>Добавить нового пользователя</h3>
            <div className="form-group">
              <label>ФИО</label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Пароль</label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Роль</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              >
                <option value="employee">Сотрудник</option>
                <option value="admin">Администратор</option>
              </select>
            </div>
            <div className="form-buttons">
              <button type="submit" className="submit-button">Сохранить</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="cancel-button">
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="users-list">
        {users.map(user => (
          <div key={user.id} className="user-card">
            <div className="user-info">
              <h3>{user.name}</h3>
              <p>{user.email}</p>
              <span className={`role-badge ${user.role}`}>
                {user.role === 'admin' ? 'Администратор' : 'Сотрудник'}
              </span>
            </div>
            <div className="user-actions">
              <button className="edit-button">Редактировать</button>
              <button className="delete-button">Удалить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Компонент управления новостями
const NewsManagement = () => {
  const [news, setNews] = useState([
    { 
      id: 1, 
      title: 'Обновление системы', 
      content: 'Запущена новая версия портала',
      date: '2024-03-20',
      author: 'Администратор'
    }
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNews, setNewNews] = useState({ title: '', content: '' });

  const handleAddNews = (e) => {
    e.preventDefault();
    const currentDate = new Date().toISOString().split('T')[0];
    setNews([...news, { 
      ...newNews, 
      id: news.length + 1,
      date: currentDate,
      author: 'Администратор'
    }]);
    setNewNews({ title: '', content: '' });
    setShowAddForm(false);
  };

  return (
    <div className="news-management">
      <div className="section-header">
        <h2>Управление новостями</h2>
        <button className="add-button" onClick={() => setShowAddForm(true)}>
          Добавить новость
        </button>
      </div>

      {showAddForm && (
        <div className="add-form-container">
          <form onSubmit={handleAddNews} className="add-form">
            <h3>Добавить новость</h3>
            <div className="form-group">
              <label>Заголовок</label>
              <input
                type="text"
                value={newNews.title}
                onChange={(e) => setNewNews({...newNews, title: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Содержание</label>
              <textarea
                value={newNews.content}
                onChange={(e) => setNewNews({...newNews, content: e.target.value})}
                required
                rows="4"
              />
            </div>
            <div className="form-buttons">
              <button type="submit" className="submit-button">Сохранить</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="cancel-button">
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="news-list">
        {news.map(item => (
          <div key={item.id} className="news-card">
            <div className="news-info">
              <h3>{item.title}</h3>
              <p>{item.content}</p>
              <div className="news-meta">
                <span>{item.date}</span>
                <span>{item.author}</span>
              </div>
            </div>
            <div className="news-actions">
              <button className="edit-button">Редактировать</button>
              <button className="delete-button">Удалить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel; 