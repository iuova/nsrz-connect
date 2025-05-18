import express from 'express';
import Department from '../models/Department.js';

const router = express.Router();

// Получить полную структуру предприятия
router.get('/', async (req, res) => {
  try {
    const departments = await Department.getAllWithEmployees();
    res.json({
      name: 'НСРЗ',
      departments
    });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router; 