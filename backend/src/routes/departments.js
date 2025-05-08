import express from 'express';
import Department from '../models/Department.js';

const router = express.Router();

// Создание нового отдела
router.post('/', async (req, res) => {
  try {
    const { name, fullname, code_zup, organization } = req.body;
    
    if (!name || !fullname || !code_zup || !organization) {
      return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
    }

    const id = await Department.create({ name, fullname, code_zup, organization });
    res.status(201).json({ id });
  } catch (err) {
    console.error('Ошибка создания отдела:', err);
    res.status(500).json({ error: 'Ошибка сервера при создании отдела' });
  }
});

// Получение всех отделов
router.get('/', async (req, res) => {
  try {
    const departments = await Department.getAll();
    res.json(departments);
  } catch (err) {
    console.error('Ошибка получения отделов:', err);
    res.status(500).json({ error: 'Ошибка сервера при получении отделов' });
  }
});

// Получение отдела по ID
router.get('/:id', async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ error: 'Отдел не найден' });
    }
    res.json(department);
  } catch (err) {
    console.error('Ошибка получения отдела:', err);
    res.status(500).json({ error: 'Ошибка сервера при получении отдела' });
  }
});

// Обновление отдела
router.put('/:id', async (req, res) => {
  try {
    const { name, fullname, code_zup, organization } = req.body;
    
    if (!name || !fullname || !code_zup || !organization) {
      return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
    }

    const updated = await Department.update(req.params.id, { 
      name, 
      fullname, 
      code_zup, 
      organization 
    });

    if (!updated) {
      return res.status(404).json({ error: 'Отдел не найден' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка обновления отдела:', err);
    res.status(500).json({ error: 'Ошибка сервера при обновлении отдела' });
  }
});

// Удаление отдела
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Department.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Отдел не найден' });
    }
    res.status(204).end();
  } catch (err) {
    console.error('Ошибка удаления отдела:', err);
    res.status(500).json({ error: 'Ошибка сервера при удалении отдела' });
  }
});

export default router; 