import User from '../src/models/Users.js';
import bcrypt from 'bcryptjs';

const email = '222@nsrz.ru';
const password = '222';
const lastname = '222';
const firstname = '222';
const midlename = '222';
const role = 'admin';
const status = 'active';
const department = 'IT';

// Хэшируем пароль
bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Ошибка при хэшировании пароля:', err);
    return;
  }

  User.create({ email, password: hash, lastname, firstname, midlename, role, status, department }, (err, id) => {
    if (err) {
      console.error('Ошибка при добавлении пользователя:', err);
    } else {
      console.log(`Пользователь добавлен с ID: ${id}`);
    }
  });
});