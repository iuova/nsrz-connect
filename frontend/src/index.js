import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log('Starting application...'); // Отладочное сообщение

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement); // Проверка наличия root элемента

if (!rootElement) {
  console.error('Root element not found!');
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('Application rendered'); // Подтверждение рендеринга
} 