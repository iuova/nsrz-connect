import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (email === 'admin@nsrz.ru' && password === 'admin') {
        const userData = {
          id: 1,
          email,
          role: 'admin',
          name: 'Администратор'
        };
        login(userData);
        navigate('/');
        return;
      }
      
      if (email === 'user@nsrz.ru' && password === 'user') {
        const userData = {
          id: 2,
          email,
          role: 'employee',
          name: 'Сотрудник'
        };
        login(userData);
        navigate('/');
        return;
      }

      setError('Неверный email или пароль');
    } catch (err) {
      setError('Ошибка при входе в систему');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="login-page">
      <div className="welcome-header">
        <h1>НСРЗ Коннект</h1>
        <p>Корпоративный портал АО "НСРЗ"</p>
      </div>
      
      <div className="login-container">
        <div className="login-card">
          <h2>Вход в систему</h2>
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-button">
              Войти
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 