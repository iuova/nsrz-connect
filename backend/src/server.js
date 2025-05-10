import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import rootRouter from './routes/index.js';
import newsRouter from './routes/news.js';
import usersRouter from './routes/users.js';
import departmentsRouter from './routes/departments.js';
import db from './db/initDB.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Получение текущей директории
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Настройка CORS для разрешения запросов с фронтенда
app.use(cors({
  origin: 'http://localhost:3000', // Разрешаем запросы только с локального фронтенда
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Разрешенные методы
  allowedHeaders: ['Content-Type', 'Authorization'], // Разрешенные заголовки
}));

// Парсинг JSON и форм
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Настройка статических файлов для изображений
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Определение маршрутов API
app.use('/', rootRouter);
app.use('/news', newsRouter);
app.use('/users', usersRouter);
app.use('/departments', departmentsRouter);

// Endpoint для проверки работоспособности сервера
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Endpoint для проверки подключения к БД
app.get('/db-health', async (req, res) => {
  try {
    const result = await checkDatabase();
    res.json({ status: 'ok', dbStatus: result });
  } catch (err) {
    console.error('Database health check error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Функция для проверки наличия таблицы
const checkTable = (tableName) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [tableName], (err, row) => {
      if (err) reject(err);
      resolve(!!row);
    });
  });
};

// Функция для проверки наличия всех необходимых таблиц
const checkDatabase = async () => {
  try {
    const tables = ['news', 'users', 'departments'];
    const results = await Promise.all(tables.map(table => checkTable(table)));
    
    return {
      news: results[0],
      users: results[1],
      departments: results[2]
    };
  } catch (err) {
    console.error('Error checking database tables:', err);
    throw err;
  }
};

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;