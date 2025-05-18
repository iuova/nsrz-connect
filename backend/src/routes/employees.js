import express from 'express';
import Employee from '../models/Employee.js';
import db from '../db/initDB.js';

const router = express.Router();

// Получить всех сотрудников
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.getAll();
    const formattedEmployees = employees.map(emp => ({
      ...emp,
      middlename: emp.middlename || null // Обработка отсутствия отчества
    }));
    res.json(formattedEmployees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать нового сотрудника
router.post('/', async (req, res) => {
  try {
    const {
      lastname,
      firstname,
      middlename,
      department_id,
      position_id,
      birth_date,
      hire_date,
      dismissal_date = null
    } = req.body;

    if (!lastname || !firstname || !department_id || !position_id || !birth_date || !hire_date) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    const employeeId = await Employee.create({
      lastname,
      firstname,
      middlename,
      department_id,
      position_id,
      birth_date,
      hire_date,
      dismissal_date
    });
    res.status(201).json({ id: employeeId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить данные сотрудника
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      lastname,
      firstname,
      middlename,
      department_id,
      position_id,
      birth_date,
      hire_date,
      dismissal_date = null
    } = req.body;

    const updated = await Employee.update(id, {
      lastname,
      firstname,
      middlename,
      department_id,
      position_id,
      birth_date,
      hire_date,
      dismissal_date
    });

    if (!updated) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить сотрудника
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Employee.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Массовая загрузка сотрудников
router.post('/bulk-upload', async (req, res) => {
  const employees = req.body.employees;
  if (!Array.isArray(employees) || employees.length === 0) {
    return res.status(400).json({ error: 'Нет данных для загрузки' });
  }
  // Проверяем, что структура данных совпадает с таблицей employees
  // Ожидаемые поля:
  const requiredFields = ['lastname', 'firstname', 'middlename', 'department_id', 'position_id', 'birth_date', 'hire_date', 'dismissal_date'];
  const missingFields = requiredFields.filter(f => !(f in employees[0]));
  if (missingFields.length > 0) {
    return res.status(400).json({ error: 'Некорректная структура данных. Отсутствуют поля: ' + missingFields.join(', ') });
  }
  const placeholders = requiredFields.map(() => '?').join(',');
  const sql = `INSERT INTO employees (${requiredFields.join(',')}) VALUES (${placeholders})`;
  const errors = [];
  for (const emp of employees) {
    try {
      const values = requiredFields.map(f => emp[f] ?? null);
      await new Promise((resolve, reject) => {
        db.run(sql, values, (err) => {
          if (err) reject(err); else resolve();
        });
      });
    } catch (err) {
      console.error('Ошибка при загрузке сотрудника:', emp, err);
      errors.push({ emp, error: err.message });
    }
  }
  if (errors.length > 0) {
    return res.status(500).json({ error: 'Часть сотрудников не загружена', details: errors });
  }
  res.json({ success: true });
});

export default router;