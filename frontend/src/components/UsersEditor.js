import React, { useState } from 'react';
import { createUser, updateUser } from '../api/usersApi';
import './UsersEditor.css';

const UsersEditor = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: user?.password || '',
    lastname: user?.lastname || '',
    firstname: user?.firstname || '',
    midlename: user?.midlename || '',
    role: user?.role || '',
    status: user?.status || '',
    department: user?.department || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (user?.id) {
        await updateUser(user.id, formData);
      } else {
        await createUser(formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  return (
    <div className="editor-modal">
      <form onSubmit={handleSubmit} className="editor-form">
        <h2>{user?.id ? 'Пользователь (редактирование)' : 'Пользователь (создание)'}</h2>
        
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Пароль:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Фамилия:
          <input
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Имя:
          <input
            type="text"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Отчество:
          <input
            type="text"
            name="midlename"
            value={formData.midlename}
            onChange={handleChange}
          />
        </label>

        <label>
          Роль:
          <input
            type="text"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Статус:
          <input
            type="text"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Отдел:
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
          />
        </label>

        <div className="form-actions">
          <button type="submit" className="btn-save">
            Сохранить
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            className="btn-cancel"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

export default UsersEditor;