import express from 'express';
import Position from '../models/Position.js';

const router = express.Router();

// Получить все должности
router.get('/', async (req, res) => {
  try {
    const positions = await Position.findAll();
    res.json(positions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать новую должность
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const position = await Position.create({ name, description });
    res.status(201).json(position);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить должность
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const position = await Position.findByPk(id);
    if (!position) {
      return res.status(404).json({ error: 'Position not found' });
    }
    position.name = name || position.name;
    position.description = description || position.description;
    await position.save();
    res.json(position);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить должность
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const position = await Position.findByPk(id);
    if (!position) {
      return res.status(404).json({ error: 'Position not found' });
    }
    await position.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;