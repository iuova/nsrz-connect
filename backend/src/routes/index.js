import express from 'express';

const router = express.Router();

// Корневой маршрут для проверки API
router.get('/', (req, res) => {
  res.json({
    message: 'API работает',
    version: '1.0.0',
    endpoints: [
      { path: '/health', description: 'Проверка работоспособности сервера' },
      { path: '/db-health', description: 'Проверка подключения к базе данных' },
      { path: '/news', description: 'Управление новостями' },
      { path: '/users', description: 'Управление пользователями' },
      { path: '/departments', description: 'Управление отделами' },
    ]
  });
});

export default router; 