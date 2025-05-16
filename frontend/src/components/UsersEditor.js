import React, { useState, useEffect } from 'react';
import { createUser, updateUser } from '../api/usersApi';
import { getDepartments } from '../api/departmentsApi';
import './UsersEditor.css';

const UsersEditor = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    lastname: user?.lastname || '',
    firstname: user?.firstname || '',
    midlename: user?.midlename || '',
    role: user?.id ? user?.role || 'user' : '',
    status: user?.id ? user?.status || 'active' : '',
    department_id: user?.department_id || ''
  });
  
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true);
      try {
        const data = await getDepartments();
        setDepartments(data);
        if (!user?.id && data.length > 0) {
          setFormData(prev => ({ ...prev, department_id: data[0].id }));
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDepartments();
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      setFormData({
        email: user.email || '',
        password: '',
        lastname: user.lastname || '',
        firstname: user.firstname || '',
        midlename: user.midlename || '',
        role: user.role || 'user',
        status: user.status || 'active',
        department_id: user.department_id || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.firstname || !formData.lastname || !formData.department_id || !formData.role || !formData.status) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    if (!user?.id && !formData.password) {
      setError('Пароль обязателен для нового пользователя');
      return;
    }
    
    try {
      if (user?.id) {
        await updateUser(user.id, formData);
      } else {
        await createUser(formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving user:', error);
      setError(error.response?.data?.error || error.message || 'Ошибка сохранения');
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const roles = [
    { value: 'admin', label: 'Администратор' },
    { value: 'user', label: 'Пользователь' },
    { value: 'hr', label: 'Кадровый сотрудник' }
  ];
  
  const statuses = [
    { value: 'active', label: 'Активный' },
    { value: 'blocked', label: 'Заблокирован' }
  ];

  return (
    <div className="editor-modal">
      <form onSubmit={handleSubmit} className="editor-form">
        <button 
          type="button" 
          className="close-button" 
          onClick={onCancel} 
          aria-label="Закрыть"
        ></button>
        
        <h2>{user?.id ? 'Пользователь (редактирование)' : 'Пользователь (создание)'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="name-row">
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
        </div>
        
        <div className="form-groups-container">
          <div className="form-group form-group-department">
            <label>
              Подразделение:
              <select
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                required
                disabled={loading}
                className="select-placeholder"
              >
               <option value="" disabled>Выберите подразделение</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-group form-group-email">
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
          </div>

          <div className="form-group form-group-password">
            <label>
              Пароль:
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!user?.id}
                  placeholder={user?.id ? "Оставьте пустым, чтобы не менять" : ""}
                />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={togglePasswordVisibility}
                 aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                >
                  <i className={`password-icon ${showPassword ? 'visible' : 'hidden'}`}></i>
                </button>
              </div>
            </label>
          </div>

          <div className="form-group form-group-role" data-testid="role-group">
            <label>
              Роль:
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="select-placeholder"
              >
                <option value="" disabled>Выберите роль</option>
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-group form-group-status" data-testid="status-group">
            <label>
              Статус:
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="select-placeholder"
              >
                <option value="" disabled>Выберите статус</option>
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-add">
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