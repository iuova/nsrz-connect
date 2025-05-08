import express from 'express';
import cors from 'cors';
import newsRouter from './routes/news.js';
import usersRouter from './routes/users.js';
import departmentsRouter from './routes/departments.js';
import db from './db/initDB.js';

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/news', newsRouter);
app.use('/api/users', usersRouter);
app.use('/api/departments', departmentsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Проверка существования основных таблиц
const checkTable = (tableName) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
      [tableName],
      (err, row) => {
        if (err) return reject(err);
        resolve(!!row);
      }
    );
  });
};

// Асинхронная проверка всех таблиц
const checkDatabase = async () => {
  try {
    const tables = ['news', 'users', 'Departments'];
    const results = await Promise.all(tables.map(checkTable));
    
    results.forEach((exists, index) => {
      if (!exists) {
        console.error(`Table ${tables[index]} not found!`);
        process.exit(1);
      }
    });
    
    console.log('All required tables exist');
  } catch (err) {
    console.error('Database check failed:', err);
    process.exit(1);
  }
};

// Выполняем проверку
checkDatabase();