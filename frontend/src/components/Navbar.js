import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          НСРЗ Коннект
        </Link>
        <div className="navbar-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Главная
          </Link>
          <Link 
            to="/news" 
            className={`nav-link ${location.pathname === '/news' ? 'active' : ''}`}
          >
            Новости
          </Link>
          <Link 
            to="/structure" 
            className={`nav-link ${location.pathname === '/structure' ? 'active' : ''}`}
          >
            Структура
          </Link>
          <Link 
            to="/phonebook" 
            className={`nav-link ${location.pathname === '/phonebook' ? 'active' : ''}`}
          >
            Справочник
          </Link>
          <Link 
            to="/resources" 
            className={`nav-link ${location.pathname === '/resources' ? 'active' : ''}`}
          >
            Ресурсы
          </Link>
          {isAdmin() && (
            <Link 
              to="/admin" 
              className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
            >
              Администрирование
            </Link>
          )}
        </div>
        <div className="navbar-user">
          <span className="user-name">{user?.name}</span>
          <button onClick={logout} className="logout-button">Выйти</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 