import db from '../src/db/initDB.js';

const checkPositions = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM positions', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

checkPositions()
  .then((positions) => {
    console.log('Список должностей:');
    console.table(positions); // Вывод в виде таблицы
    process.exit(0);
  })
  .catch((err) => {
    console.error('Ошибка при получении должностей:', err);
    process.exit(1);
  });