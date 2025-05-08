import db from '../src/db/initDB.js';

const checkDepartments = () => {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        id,
        name AS 'Название',
        fullname AS 'Полное название', 
        code_zup AS 'Код ЗУП',
        organization AS 'Организация'
      FROM Departments
      ORDER BY name
    `, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

checkDepartments()
  .then((departments) => {
    if (departments.length === 0) {
      console.log('В базе нет подразделений');
    } else {
      console.log('Список подразделений:');
      console.table(departments); // Красивый вывод в табличном формате
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error('Ошибка при получении подразделений:', err.message);
    console.error('Убедитесь что:');
    console.error('1. Таблица Departments существует');
    console.error('2. Структура таблицы соответствует ожидаемой');
    process.exit(1);
  }); 