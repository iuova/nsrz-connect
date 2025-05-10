import express from 'express';
import News from '../models/News.js';
import db from '../db/initDB.js';

const router = express.Router();

// Получение новостей
router.get('/', async (req, res) => {
  const showAll = req.query.all === 'true';
  
  try {
    const news = await News.getAll(!showAll);
    res.json(news);
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Создание новости (стандартный маршрут)
router.post('/', async (req, res) => {
  // Проверка корректности Content-Type
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')) {
    return res.status(400).json({ 
      error: 'Content-Type must be application/json',
      received: req.headers['content-type'] 
    });
  }
  
  // Проверка, что тело запроса не пустое
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Empty request body' });
  }
  
  const { title, content } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    // Добавляем createdBy из аутентификации пользователя, если есть
    const createdBy = req.user ? req.user.id : null;
    
    const result = await News.create({
      title,
      content,
      published: 0,
      createdBy
    });
    
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating news:', err);
    res.status(500).json({ 
      error: 'Database error: ' + (err.message || '')
    });
  }
});

// Гарантированное создание новости (прямой доступ к базе данных)
router.post('/guaranteed-create', async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Требуются поля title и content' });
    }
    
    // Прямой запрос к базе без лишних проверок
    db.run(
      "INSERT INTO news (title, content, published, createdAt) VALUES (?, ?, ?, datetime('now'))",
      [title, content, 0],
      function(err) {
        if (err) {
          console.error('Ошибка при создании новости:', err);
          return res.status(500).json({ error: 'Ошибка базы данных: ' + err.message });
        }
        
        const newsId = this.lastID;
        
        // Получаем созданную запись
        db.get("SELECT * FROM news WHERE id = ?", [newsId], (err, row) => {
          if (err) {
            return res.status(200).json({
              id: newsId,
              title: title,
              content: content,
              published: 0,
              createdAt: new Date().toISOString()
            });
          }
          
          res.status(201).json(row);
        });
      }
    );
  } catch (error) {
    console.error('Непредвиденная ошибка:', error);
    res.status(500).json({ error: 'Непредвиденная ошибка сервера' });
  }
});

// Обновление новости
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    const result = await News.update(id, { title, content });
    res.json(result);
  } catch (err) {
    console.error('Error updating news:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Удаление новости
router.delete('/:id', async (req, res) => {
  try {
    await News.delete(req.params.id);
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting news:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Публикация новости
router.patch('/:id/publish', async (req, res) => {
  try {
    await News.publish(req.params.id, req.body.published);
    res.status(204).end();
  } catch (err) {
    console.error('Error publishing news:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;

