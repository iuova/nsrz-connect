import db from '../src/db/initDB.js';

async function setDepartmentTo2() {
  console.log('Начинаем обновление поля department в таблице users...');

  // Проверяем существование подразделения с id = 2
  const departmentExists = await new Promise((resolve, reject) => {
    db.get(
      "SELECT 1 FROM Departments WHERE id = ?",
      [2],
      (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      }
    );
  });

  if (!departmentExists) {
    console.error('Ошибка: подразделение с id = 2 не найдено в таблице Departments.');
    process.exit(1);
  }

  // Обновляем поле department для всех записей
  db.run(
    "UPDATE users SET department = ?",
    [2],
    function(err) {
      if (err) {
        console.error('Ошибка при обновлении записей:', err);
        process.exit(1);
      }
      console.log(`Успешно обновлено ${this.changes} записей. Поле department установлено в 2.`);
      finish();
    }
  );
}

function finish() {
  db.close(() => process.exit(0));
}

setDepartmentTo2(); 