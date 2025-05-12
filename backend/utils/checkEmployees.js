import db from '../src/db/initDB.js';

const checkEmployees = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM employees', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

checkEmployees()
  .then((employees) => {
    console.log('Список сотрудников:');
    console.table(employees); // Вывод в виде таблицы
    process.exit(0);
  })
  .catch((err) => {
    console.error('Ошибка при получении сотрудников:', err);
    process.exit(1);
  });