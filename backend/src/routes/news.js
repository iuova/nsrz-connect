import express from 'express';
import News from '../models/News.js';
import db from '../db/initDB.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Настройка хранилища для загрузки файлов
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads');
    
    // Создаем директорию, если она не существует
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Генерация уникального имени файла
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'image-' + uniqueSuffix + ext);
  }
});

// Фильтр для проверки типа файла
const fileFilter = (req, file, cb) => {
  // Допустимые типы файлов
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Недопустимый тип файла. Разрешены только изображения (JPEG, PNG, GIF, WEBP)'), false);
  }
};

// Инициализация Multer
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Ограничение размера файла (5MB)
  }
});

// Получение всех новостей с пагинацией и поиском
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const showAll = req.query.all === 'true';
    
    const offset = (page - 1) * limit;
    
    // Запрос для получения новостей с пагинацией и поиском
    let query = `
      SELECT 
        n.id, 
        n.title, 
        n.content, 
        n.published, 
        n.image,
        n.author_id,
        u.email as author_email,
        n.created_at, 
        n.publish_date
      FROM news n
      LEFT JOIN users u ON n.author_id = u.id
    `;
    
    let countQuery = `SELECT COUNT(*) as total FROM news`;
    const queryParams = [];
    
    if (!showAll) {
      query += ` WHERE n.published = 1`;
      countQuery += ` WHERE published = 1`;
    }
    
    if (search) {
      if (query.includes('WHERE')) {
        query += ` AND n.title LIKE ?`;
        countQuery += ` AND title LIKE ?`;
      } else {
        query += ` WHERE n.title LIKE ?`;
        countQuery += ` WHERE title LIKE ?`;
      }
      queryParams.push(`%${search}%`);
    }
    
    // Добавляем сортировку и пагинацию
    query += ` ORDER BY 
      CASE WHEN n.published = 1 THEN n.publish_date ELSE n.created_at END DESC
      LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);
    
    // Выполняем запрос для получения новостей
    const news = await new Promise((resolve, reject) => {
      db.all(query, queryParams, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Выполняем запрос для получения общего количества новостей
    const countResult = await new Promise((resolve, reject) => {
      db.get(countQuery, queryParams.slice(0, queryParams.length - 2), (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    res.json({
      news,
      total: countResult.total,
      page,
      limit
    });
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).json({ error: 'Ошибка базы данных' });
  }
});

// Получение конкретной новости по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        n.id, 
        n.title, 
        n.content, 
        n.published, 
        n.image,
        n.author_id,
        u.email as author_email,
        n.created_at, 
        n.publish_date
      FROM news n
      LEFT JOIN users u ON n.author_id = u.id
      WHERE n.id = ?
    `;
    
    const news = await new Promise((resolve, reject) => {
      db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!news) {
      return res.status(404).json({ error: 'Новость не найдена' });
    }
    
    res.json(news);
  } catch (err) {
    console.error('Error fetching news by ID:', err);
    res.status(500).json({ error: 'Ошибка базы данных' });
  }
});

// Маршрут для загрузки изображений
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не был загружен' });
    }
    
    // Возвращаем информацию о загруженном файле
    res.json({
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`
    });
  } catch (err) {
    console.error('Error uploading image:', err);
    res.status(500).json({ error: 'Ошибка загрузки файла' });
  }
});

// Создание новости
router.post('/', async (req, res) => {
  try {
    const { title, content, image } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Заголовок и содержимое обязательны' });
    }
    
    // Получаем ID пользователя из аутентификации, если есть
    const authorId = req.user ? req.user.id : null;
    
    const query = `
      INSERT INTO news (
        title, 
        content, 
        image, 
        published, 
        author_id, 
        created_at
      ) VALUES (?, ?, ?, ?, ?, datetime('now'))
    `;
    
    const result = await new Promise((resolve, reject) => {
      db.run(query, [title, content, image, 0, authorId], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
    
    // Получаем созданную новость
    const news = await new Promise((resolve, reject) => {
      db.get(`SELECT * FROM news WHERE id = ?`, [result.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    res.status(201).json(news);
  } catch (err) {
    console.error('Error creating news:', err);
    res.status(500).json({ error: 'Ошибка создания новости' });
  }
});

// Обновление новости
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, image } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Заголовок и содержимое обязательны' });
    }
    
    // Проверяем, существует ли новость
    const newsExists = await new Promise((resolve, reject) => {
      db.get(`SELECT id FROM news WHERE id = ?`, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!newsExists) {
      return res.status(404).json({ error: 'Новость не найдена' });
    }
    
    // Обновляем новость
    const query = `
      UPDATE news 
      SET title = ?, content = ?, image = ?, updated_at = datetime('now')
      WHERE id = ?
    `;
    
    await new Promise((resolve, reject) => {
      db.run(query, [title, content, image, id], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Получаем обновленную новость
    const updatedNews = await new Promise((resolve, reject) => {
      db.get(`SELECT * FROM news WHERE id = ?`, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    res.json(updatedNews);
  } catch (err) {
    console.error('Error updating news:', err);
    res.status(500).json({ error: 'Ошибка обновления новости' });
  }
});

// Изменение статуса публикации
router.put('/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const { published } = req.body;
    
    if (published === undefined) {
      return res.status(400).json({ error: 'Статус публикации должен быть указан' });
    }
    
    const isPublished = published ? 1 : 0;
    const publishDate = published ? `datetime('now')` : 'NULL';
    
    const query = `
      UPDATE news 
      SET published = ?, publish_date = ${publishDate}
      WHERE id = ?
    `;
    
    await new Promise((resolve, reject) => {
      db.run(query, [isPublished, id], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Получаем обновленную новость
    const updatedNews = await new Promise((resolve, reject) => {
      db.get(`SELECT * FROM news WHERE id = ?`, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    res.json({ 
      id: updatedNews.id,
      published: Boolean(updatedNews.published)
    });
  } catch (err) {
    console.error('Error updating publish status:', err);
    res.status(500).json({ error: 'Ошибка изменения статуса публикации' });
  }
});

// Удаление новости
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Получаем информацию о новости, чтобы удалить файл изображения, если есть
    const news = await new Promise((resolve, reject) => {
      db.get(`SELECT image FROM news WHERE id = ?`, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (news && news.image) {
      const imagePath = path.join(process.cwd(), 'uploads', news.image);
      
      // Проверяем существование файла и удаляем его
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Удаляем новость из базы данных
    await new Promise((resolve, reject) => {
      db.run(`DELETE FROM news WHERE id = ?`, [id], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting news:', err);
    res.status(500).json({ error: 'Ошибка удаления новости' });
  }
});

export default router;

