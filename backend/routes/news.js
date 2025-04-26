import express from 'express';
const router = express.Router();
const multer = require('multer');
const path = require('path');
const News = require('../models/News');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload image endpoint
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded or invalid file type' });
  }
  res.json({ url: `/uploads/${req.file.filename}` });
}, (err, req, res, next) => {
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

// Create/update news endpoint
router.post('/', async (req, res) => {
  try {
    const newsItem = await News.create(req.body);
    res.status(201).json(newsItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get news endpoint
router.get('/', async (req, res) => {
  try {
    const publishedOnly = req.query.published === 'true';
    const news = await News.getAll(publishedOnly);
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update news endpoint
router.put('/:id', async (req, res) => {
  try {
    const updated = await News.update(req.params.id, req.body);
    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ error: 'News not found' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete news endpoint
router.delete('/:id', async (req, res) => {
  try {
    const success = await News.delete(req.params.id);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'News not found' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Publish multiple news endpoint
router.post('/publish', async (req, res) => {
  try {
    const count = await News.publishMultiple(req.body.ids);
    res.json({ published: count });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 