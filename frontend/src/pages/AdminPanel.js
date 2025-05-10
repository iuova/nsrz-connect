import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import NewsTab from '../components/admin/NewsTab';
import UsersTab from '../components/admin/UsersTab';
import DepartmentsTab from '../components/admin/DepartmentsTab';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('news');
  const { isAdmin } = useAuth();

  if (!isAdmin()) return <div className="error">Доступ запрещен</div>;

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
        <button
          className={`tab ${activeTab === 'departments' ? 'active' : ''}`}
          onClick={() => setActiveTab('departments')}
        >
          Управление структурой
        </button>
      </div>

      {activeTab === 'news' && <NewsTab />}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'departments' && <DepartmentsTab />}
    </div>
  );
};

export default AdminPanel;