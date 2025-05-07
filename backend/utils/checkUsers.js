import db from '../src/db/initDB.js';

const checkUsers = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM users', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

checkUsers()
  .then((users) => {
    console.log('Список пользователей:');
    console.table(users); // Вывод в виде таблицы
    process.exit(0);
  })
  .catch((err) => {
    console.error('Ошибка при получении пользователей:', err);
    process.exit(1);
  });