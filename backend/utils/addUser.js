import User from '../src/models/Users.js';
import bcrypt from 'bcryptjs';
import db from '../src/db/initDB.js';

const userData = {
  email: 'admin@nsrz.ru',
  password: 'admin',
  lastname: 'admin',
  firstname: 'admin',
  midlename: 'admin',
  role: 'admin',
  status: 'active'
};

async function addAdminUser() {
  try {
    // 1. Находим ID отдела "ПЭО" (или другого нужного отдела)
    const department = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM Departments WHERE name = ?', ['ПЭО'], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!department) {
      throw new Error('Отдел "ПЭО" не найден в базе данных');
    }

    // 2. Хэшируем пароль
    const hash = await new Promise((resolve, reject) => {
      bcrypt.hash(userData.password, 10, (err, hash) => {
        if (err) reject(err);
        else resolve(hash);
      });
    });

    // 3. Создаем пользователя
    const userId = await new Promise((resolve, reject) => {
      User.create(
        {
          ...userData,
          password: hash,
          department_id: department.id
        },
        (err, id) => {
          if (err) reject(err);
          else resolve(id);
        }
      );
    });

    console.log(`Администратор успешно добавлен с ID: ${userId}`);
  } catch (err) {
    console.error('Ошибка при добавлении пользователя:', err);
  } finally {
    db.close();
  }
}

addAdminUser();