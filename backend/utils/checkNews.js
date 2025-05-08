import db from '../src/db/initDB.js';

const checkNews = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM news', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

checkNews()
  .then((news) => {
    console.log('Список новостей:');
    console.table(news); // Вывод в виде таблицы
    process.exit(0);
  })
  .catch((err) => {
    console.error('Ошибка при получении новостей:', err);
    process.exit(1);
  });