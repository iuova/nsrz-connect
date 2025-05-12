import express from 'express';
import Employee from '../models/Employee.js';

const router = express.Router();

// Получить всех сотрудников
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.getAll();
    res.json(employees);
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

export default router;