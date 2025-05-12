import express from 'express';
import User from '../models/Users.js';
import bcrypt from 'bcryptjs';
import db from '../db/initDB.js';

const router = express.Router();

// Маршрут для авторизации
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Ищем пользователя по email
    const user = await new Promise((resolve, reject) => {
      User.findByEmail(email, (err, user) => {
        if (err) {
          console.error('Ошибка при поиске пользователя:', err);
          reject(err);
        } else {
          console.log('Найден пользователь:', user);
          resolve(user);
        }
      });
    });

    if (!user) {
      console.log('Пользователь не найден');
      return res.status(401).json({ success: false, message: 'Неверный email или пароль' });
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Неверный пароль');
      return res.status(401).json({ success: false, message: 'Неверный email или пароль' });
    }

    // Возвращаем данные пользователя
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Ошибка при входе в систему' });
  }
});

// Создание пользователя (теперь требует department_id)
router.post('/', async (req, res) => {
  try {
    const id = await User.create(req.body);
    res.json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Получение пользователей с JOIN к Departments
router.get('/', async (req, res) => {
  try {
    const users = await new Promise((resolve, reject) => {
      const sql = `
        SELECT u.*, d.name as department_name 
        FROM users u
        LEFT JOIN Departments d ON u.department_id = d.id
      `;
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    res.json(users);
  } catch (err) {
    console.error('Ошибка получения пользователей:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получение пользователя по ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  User.findById(id, (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  });
});

// Обновление пользователя
router.put('/:id', (req, res) => {
  const { id } = req.params;
  console.log(`Получен запрос на обновление пользователя ${id}:`, req.body);
  const { email, password, lastname, firstname, midlename, role, status, department } = req.body;
  
  User.update(id, { email, password, lastname, firstname, midlename, role, status, department }, (err) => {
    if (err) {
      console.error('Ошибка при обновлении пользователя:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log(`Пользователь ${id} успешно обновлен`);
    res.json({ message: 'User updated successfully' });
  });
});

// Удаление пользователя
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  User.delete(id, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'User deleted successfully' });
  });
});

export default router;