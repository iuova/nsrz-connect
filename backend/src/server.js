import express from 'express';
import cors from 'cors';
import newsRouter from './routes/news.js';
import db from './db/initDB.js'; // Используем ES Modules

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // URL вашего фронтенда
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/news', newsRouter);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Проверка соединения с БД
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='news'", (err, row) => {
  if (err) {
    console.error('Database check failed:', err);
    process.exit(1);
  }
  if (!row) {
    console.error('News table not found!');
    process.exit(1);
  }
}); 