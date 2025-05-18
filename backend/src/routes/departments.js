import express from 'express';
import Department from '../models/Department.js';

const router = express.Router();

// Создание нового отдела
router.post('/', async (req, res) => {
  try {
    const { name, fullname, code_zup, organization, parent_id } = req.body;
    
    if (!name || !fullname || !code_zup || !organization) {
      return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
    }

    const id = await Department.create({ name, fullname, code_zup, organization, parent_id });
    res.status(201).json({ id });
  } catch (err) {
    console.error('Ошибка создания отдела:', err);
    res.status(500).json({ error: 'Ошибка сервера при создании отдела' });
  }
});

// Получение всех отделов с сотрудниками
router.get('/', async (req, res) => {
  try {
    const departments = await Department.getAllWithEmployees();
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
    // Проверяем, есть ли пользователи с этим department_id
    const usersWithDepartment = await new Promise((resolve, reject) => {
      const sql = `SELECT COUNT(*) as count FROM users WHERE department_id = ?`;
      db.get(sql, [req.params.id], (err, row) => {
        if (err) reject(err);
        else resolve(row.count > 0);
      });
    });

    if (usersWithDepartment) {
      return res.status(400).json({ 
        error: 'Нельзя удалить отдел: есть привязанные пользователи' 
      });
    }

    const deleted = await Department.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Отдел не найден' });
    }
    res.status(204).end();
  } catch (err) {
    console.error('Ошибка удаления отдела:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить иерархию подразделений
router.get('/hierarchy', async (req, res) => {
  try {
    const hierarchy = await Department.getHierarchy();
    res.json(hierarchy);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router; 