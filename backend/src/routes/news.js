import express from 'express';
import db from '../db/initDB.js';

const router = express.Router();

// Получение новостей
router.get('/', async (req, res) => {
  const showAll = req.query.all === 'true';
  const sql = `
    SELECT * FROM news
    ${showAll ? '' : 'WHERE published = 1'}
    ORDER BY createdAt DESC
  `;

  try {
    const news = await new Promise((resolve, reject) => {
      db.all(sql, [], (err, rows) => {
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
  const { title, content, createdAt, createdBy } = req.body;
  if (!title || !content || !createdAt || !createdBy) {
    return res.status(400).json({ error: 'Title, content, createdAt, createdBy are required' });
  }

  try {
    const result = await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO news (title, content, createdAt, createdBy) VALUES (?, ?, ?, ?)",
        [title, content, createdAt, createdBy],
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

// Удаление новости
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

// Публикация новости
router.patch('/:id/publish', async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      db.run(
        "UPDATE news SET published = ? WHERE id = ?",
        [req.body.published ? 1 : 0, req.params.id],
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
export default router;

