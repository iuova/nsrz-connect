import express from 'express';
import db from '../db/initDB.js';

const router = express.Router();

// Получение всех новостей
router.get('/', async (req, res) => {
  try {
    const news = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM news ORDER BY createdAt DESC", [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    res.json(news);
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Создание новости
router.post('/', async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    const result = await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO news (title, content) VALUES (?, ?)",
        [title, content],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating news:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Другие CRUD-операции (пример для удаления)
router.delete('/:id', async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      db.run("DELETE FROM news WHERE id = ?", [req.params.id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting news:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Добавьте этот новый роут
router.patch('/:id/publish', async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      db.run(
        "UPDATE news SET published = ? WHERE id = ?",
        [req.body.published, req.params.id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    res.status(204).end();
  } catch (err) {
    console.error('Error publishing news:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Экспорт
export default router; // Важно: default export

