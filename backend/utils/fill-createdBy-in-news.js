import db from '../src/db/initDB.js';

async function fillCreatedBy() {
  console.log('Проверяем существование пользователя с id = 2...');

  // Проверяем, существует ли пользователь 2
  const userExists = await new Promise((resolve, reject) => {
    db.get('SELECT 1 FROM users WHERE id = ?', [2], (err, row) => {
      if (err) reject(err);
      else resolve(!!row);
    });
  });

  if (!userExists) {
    console.error('Ошибка: пользователь с id = 2 не найден в таблице users.');
    process.exit(1);
  }

  console.log('Начинаем заполнение поля createdBy в таблице news...');

  // Обновляем записи
  db.run(
    'UPDATE news SET createdBy = ? WHERE createdBy IS NULL',
    [222],
    function(err) {
      if (err) {
        console.error('Ошибка при обновлении записей:', err);
        process.exit(1);
      }
      console.log(`Успешно обновлено ${this.changes} записей. Поле createdBy заполнено значением 2.`);
      finish();
    }
  );
}

function finish() {
  db.close(() => process.exit(0));
}

fillCreatedBy(); 