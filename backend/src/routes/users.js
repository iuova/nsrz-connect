import express from 'express';
import User from '../models/Users.js';
import bcrypt from 'bcryptjs';
import db from '../db/initDB.js';

const router = express.Router();

// Функция для проверки существования департамента
const checkDepartmentExists = (departmentId) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT id FROM Departments WHERE id = ?', [departmentId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(!!row); // Преобразуем результат в булево значение
      }
    });
  });
};

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

// Создание нового пользователя
router.post('/', async (req, res) => {
  const { email, password, lastname, firstname, midlename, role, status, department } = req.body;
  
  console.log('Получен запрос на создание пользователя:', { 
    email, 
    lastname, 
    firstname, 
    midlename, 
    role, 
    status, 
    department,
    password: password ? '[СКРЫТ]' : undefined 
  });
  
  // Выводим информацию о запросе
  console.log('Headers:', req.headers);
  console.log('Body (без пароля):', { ...req.body, password: req.body.password ? '[СКРЫТ]' : undefined });
  
  // Проверка структуры базы данных
  try {
    const tableInfo = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(users);", [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    console.log('Структура таблицы users:', tableInfo);
    
    // Проверка FOREIGN KEY constraints
    const fkInfo = await new Promise((resolve, reject) => {
      db.all("PRAGMA foreign_key_list(users);", [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    console.log('Внешние ключи таблицы users:', fkInfo);
  } catch (dbErr) {
    console.error('Ошибка при проверке структуры базы данных:', dbErr);
  }
  
  // Проверяем обязательные поля
  if (!email || !password || !lastname || !firstname || !department) {
    console.error('Отсутствуют обязательные поля для создания пользователя');
    return res.status(400).json({ 
      error: 'Отсутствуют обязательные поля (email, password, lastname, firstname, department)' 
    });
  }
  
  // Проверка, что department - число
  const departmentNumber = parseInt(department, 10);
  if (isNaN(departmentNumber)) {
    console.error('Неверный формат department (должен быть числом):', department);
    return res.status(400).json({ error: 'ID департамента должен быть числом' });
  }
  
  try {
    // Проверяем PRAGMA foreign_keys
    const pragmaResult = await new Promise((resolve, reject) => {
      db.get("PRAGMA foreign_keys;", [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    console.log('PRAGMA foreign_keys:', pragmaResult);
    
    // Включаем FOREIGN KEY constraints если они выключены
    if (pragmaResult && pragmaResult.foreign_keys === 0) {
      await new Promise((resolve, reject) => {
        db.run("PRAGMA foreign_keys = ON;", [], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log('FOREIGN KEY constraints включены');
    }
    
    // Проверяем существование департамента
    const departmentExists = await checkDepartmentExists(departmentNumber);
    if (!departmentExists) {
      console.error('Департамент с ID', departmentNumber, 'не найден');
      return res.status(400).json({ error: `Департамент с ID ${departmentNumber} не существует` });
    }
    
    // Проверяем, не занят ли email
    const existingUser = await new Promise((resolve, reject) => {
      User.findByEmail(email, (err, user) => {
        if (err) reject(err);
        else resolve(user);
      });
    });
    
    if (existingUser) {
      console.error('Email уже используется:', email);
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }
    
    // Создаем пользователя
    User.create({ 
      email, 
      password, 
      lastname, 
      firstname, 
      midlename, 
      role: role || 'user', 
      status: status || 'active', 
      department: departmentNumber
    }, (err, id) => {
      if (err) {
        console.error('Ошибка создания пользователя:', err);
        console.error('Стек ошибки:', err.stack);
        return res.status(500).json({ error: err.message });
      }
      console.log('Пользователь успешно создан, id:', id);
      res.status(201).json({ id });
    });
  } catch (err) {
    console.error('Ошибка при обработке запроса создания пользователя:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера: ' + err.message });
  }
});

// Получение всех пользователей
router.get('/', (req, res) => {
  User.findAll((err, users) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(users);
  });
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
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { email, password, lastname, firstname, midlename, role, status, department } = req.body;
  
  // Проверка существования департамента
  if (department) {
    const departmentNumber = parseInt(department, 10);
    if (isNaN(departmentNumber)) {
      return res.status(400).json({ error: 'ID департамента должен быть числом' });
    }
    
    try {
      const departmentExists = await checkDepartmentExists(departmentNumber);
      if (!departmentExists) {
        return res.status(400).json({ error: `Департамент с ID ${departmentNumber} не существует` });
      }
    } catch (err) {
      return res.status(500).json({ error: 'Ошибка при проверке департамента' });
    }
  }
  
  // Если пароль не передан, получаем текущий пароль из БД
  if (!password) {
    User.findById(id, (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Обновляем пользователя с существующим паролем
      User.update(id, { 
        email: email || user.email,
        password: user.password, // Используем существующий пароль
        lastname: lastname || user.lastname,
        firstname: firstname || user.firstname,
        midlename: midlename || user.midlename,
        role: role || user.role,
        status: status || user.status,
        department: department ? parseInt(department, 10) : user.department
      }, (updateErr) => {
        if (updateErr) {
          return res.status(500).json({ error: updateErr.message });
        }
        res.json({ message: 'User updated successfully' });
      });
    });
  } else {
    // Если пароль передан, хэшируем его и обновляем пользователя
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      User.update(id, { 
        email, 
        password: hash, 
        lastname, 
        firstname, 
        midlename, 
        role, 
        status, 
        department: parseInt(department, 10)
      }, (updateErr) => {
        if (updateErr) {
          return res.status(500).json({ error: updateErr.message });
        }
        res.json({ message: 'User updated successfully' });
      });
    });
  }
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