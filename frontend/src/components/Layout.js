import React from 'react';
import { Link } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <header className="header">
        <nav className="nav">
          <Link to="/" className="nav-item">Главная</Link>
          <Link to="/news" className="nav-item">Новости</Link>
          <Link to="/structure" className="nav-item">Структура</Link>
          <Link to="/phonebook" className="nav-item">Телефонный справочник</Link>
          <Link to="/resources" className="nav-item">Ресурсы</Link>
        </nav>
      </header>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout; 