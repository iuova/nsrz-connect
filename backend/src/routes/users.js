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
    const user = await User.findByEmail(email);
    console.log('user:', user);
    console.log('email from request:', email);
    console.log('password from request:', password);
    if (!user) {
      console.log('Пользователь не найден');
      return res.status(401).json({ success: false, message: 'Неверный email или пароль' });
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('isPasswordValid:', isPasswordValid);
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
      SELECT u.id, u.email, u.firstname, u.lastname, u.role, u.status, u.department_id, d.name as department_name 
      FROM users u
      LEFT JOIN Departments d ON u.department_id = d.id
    `;
    
    db.all(sql, [], (err, rows) => {
            if (err) {
             reject(err);
            }
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
router.get('/:id', async (req, res) => {
  try {
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
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Обновление пользователя
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, lastname, firstname, midlename, role, status, department_id } = req.body;
    User.update(id, { email, password, lastname, firstname, midlename, role, status, department_id }, (err) => {
      if (err) {
        console.error('Ошибка при обновлении пользователя:', err);
        return res.status(500).json({ error: err.message });
      }
      console.log(`Пользователь ${id} успешно обновлен`);
      res.json({ message: 'User updated successfully' });
    });
  } catch (err) {
    console.error('Ошибка при обновлении пользователя:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Удаление пользователя
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    User.delete(id, (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'User deleted successfully' });
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;