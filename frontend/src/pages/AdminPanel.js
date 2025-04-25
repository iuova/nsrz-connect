import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import axios from 'axios';
import 'react-quill/dist/quill.snow.css';
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
  const [showEditForm, setShowEditForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'employee' });
  const [editingUser, setEditingUser] = useState({ 
    id: null, 
    name: '', 
    email: '', 
    password: '', 
    role: 'employee' 
  });

  // Добавление пользователя
  const handleAddUser = (e) => {
    e.preventDefault();
    setUsers([...users, { ...newUser, id: users.length + 1 }]);
    setNewUser({ name: '', email: '', password: '', role: 'employee' });
    setShowAddForm(false);
  };

  // Удаление пользователя
  const handleDeleteUser = (userId) => {
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  // Начало редактирования
  const handleStartEdit = (user) => {
    setEditingUser({
      id: user.id,
      name: user.name,
      email: user.email,
      password: '', // Пароль не показываем при редактировании
      role: user.role
    });
    setShowEditForm(true);
  };

  // Сохранение изменений
  const handleSaveEdit = (e) => {
    e.preventDefault();
    setUsers(users.map(user => 
      user.id === editingUser.id ? { ...user, ...editingUser } : user
    ));
    setShowEditForm(false);
  };

  // Отмена редактирования
  const handleCancelEdit = () => {
    setShowEditForm(false);
  };

  return (
    <div className="user-management">
      <div className="section-header">
        <h2>Управление пользователями</h2>
        <button 
          className="add-button"
          onClick={() => setShowAddForm(true)}
        >
          Добавить пользователя
        </button>
      </div>

      {/* Форма добавления пользователя */}
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
              <div className="select-wrapper">
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="form-select"
                >
                  <option value="employee">Сотрудник</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
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

      {/* Форма редактирования пользователя */}
      {showEditForm && (
        <div className="add-form-container">
          <form onSubmit={handleSaveEdit} className="add-form">
            <h3>Редактировать пользователя</h3>
            <div className="form-group">
              <label>ФИО</label>
              <input
                type="text"
                value={editingUser.name}
                onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Новый пароль (оставьте пустым, чтобы не менять)</label>
              <input
                type="password"
                value={editingUser.password}
                onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Роль</label>
              <div className="select-wrapper">
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                  className="form-select"
                >
                  <option value="employee">Сотрудник</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
            </div>
            <div className="form-buttons">
              <button type="submit" className="submit-button">Сохранить</button>
              <button type="button" onClick={handleCancelEdit} className="cancel-button">
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
              <button 
                className="edit-button"
                onClick={() => handleStartEdit(user)}
              >
                Редактировать
              </button>
              <button 
                className="delete-button"
                onClick={() => handleDeleteUser(user.id)}
              >
                Удалить
              </button>
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
      content: '<p>Запущена новая версия портала</p>',
      date: '2024-03-20',
      author: 'Администратор',
      published: false,
      selected: false
    }
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [newNews, setNewNews] = useState({ 
    title: '', 
    content: '',
    published: false 
  });
  const [editingNews, setEditingNews] = useState({ 
    id: null,
    title: '',
    content: '',
    date: '',
    author: '',
    published: false
  });
  const quillRef = useRef(null);
  const editQuillRef = useRef(null);

  // Конфигурация Quill
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'align',
    'link', 'image'
  ];

  // Переключение выбора новости
  const toggleSelectNews = (newsId) => {
    setNews(news.map(item => 
      item.id === newsId ? { ...item, selected: !item.selected } : item
    ));
  };

  // Публикация выбранных новостей
  const publishSelectedNews = () => {
    setNews(news.map(item => 
      item.selected ? { ...item, published: true } : item
    ));
    // Здесь можно добавить API-запрос для сохранения изменений на сервере
    alert('Выбранные новости опубликованы на главной странице!');
  };

  // Добавление новости
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

  // Удаление новости
  const handleDeleteNews = (newsId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту новость?')) {
      setNews(news.filter(item => item.id !== newsId));
    }
  };

  // Начало редактирования
  const handleStartEdit = (newsItem) => {
    setEditingNews({
      id: newsItem.id,
      title: newsItem.title,
      content: newsItem.content,
      date: newsItem.date,
      author: newsItem.author
    });
    setShowEditForm(true);
  };

  // Сохранение изменений
  const handleSaveEdit = (e) => {
    e.preventDefault();
    const currentDate = new Date().toISOString().split('T')[0];
    setNews(news.map(item => 
      item.id === editingNews.id ? { 
        ...item, 
        title: editingNews.title,
        content: editingNews.content,
        date: currentDate // Обновляем дату
      } : item
    ));
    setShowEditForm(false);
  };

  // Отмена редактирования
  const handleCancelEdit = () => {
    setShowEditForm(false);
  };

  return (
    <div className="news-management">
      <div className="section-header">
        <h2>Управление новостями</h2>
        <div className="news-actions-header">
          <button 
            className="add-button"
            onClick={() => setShowAddForm(true)}
          >
            Добавить новость
          </button>
          <button 
            className="publish-button"
            onClick={publishSelectedNews}
            disabled={!news.some(item => item.selected)}
          >
            Опубликовать новости
          </button>
        </div>
      </div>

      {/* Форма добавления новости */}
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
              <ReactQuill
                ref={quillRef}
                value={newNews.content}
                onChange={(content) => setNewNews({...newNews, content})}
                modules={modules}
                formats={formats}
                theme="snow"
                placeholder="Введите текст новости..."
                style={{ minHeight: '200px', backgroundColor: 'white' }}
              />
            </div>
            <div className="form-buttons">
              <button type="submit" className="submit-button">Сохранить</button>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)} 
                className="cancel-button"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Форма редактирования новости */}
      {showEditForm && (
        <div className="add-form-container">
          <form onSubmit={handleSaveEdit} className="add-form">
            <h3>Редактировать новость</h3>
            <div className="form-group">
              <label>Заголовок</label>
              <input
                type="text"
                value={editingNews.title}
                onChange={(e) => setEditingNews({...editingNews, title: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Содержание</label>
              <ReactQuill
                ref={editQuillRef}
                value={editingNews.content}
                onChange={(content) => setEditingNews({...editingNews, content})}
                modules={modules}
                formats={formats}
                theme="snow"
                style={{ minHeight: '200px', backgroundColor: 'white' }}
              />
            </div>
            <div className="form-buttons">
              <button type="submit" className="submit-button">Сохранить</button>
              <button 
                type="button" 
                onClick={handleCancelEdit}
                className="cancel-button"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="news-list">
        {news.map(item => (
          <div key={item.id} className={`news-card ${item.published ? 'published' : ''}`}>
            <div className="news-checkbox">
              <input
                type="checkbox"
                checked={item.selected}
                onChange={() => toggleSelectNews(item.id)}
              />
            </div>
            <div className="news-info">
              <h3>{item.title} {item.published && <span className="published-badge">Опубликовано</span>}</h3>
              <div dangerouslySetInnerHTML={{ __html: item.content }} />
              <div className="news-meta">
                <span>Обновлено: {item.date}</span>
                <span>{item.author}</span>
              </div>
            </div>
            <div className="news-actions">
              <button 
                className="edit-button"
                onClick={() => handleStartEdit(item)}
              >
                Редактировать
              </button>
              <button 
                className="delete-button"
                onClick={() => handleDeleteNews(item.id)}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const NewsEditor = ({ initialData, onSave, onCancel }) => {
  // Вынести логику редактора сюда
};

export default AdminPanel; 