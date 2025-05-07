import db from '../src/db/initDB.js';
function migrate() {
  db.all('PRAGMA table_info(users)', (err, columns) => {
    if (err) {
      console.error('Не удалось получить информацию о таблице users:', err);
      process.exit(1);
    }

    const hasEmail = columns.some((c) => c.name === 'password');
    if (hasEmail) {
      console.log('Столбец `password` уже существует – миграция не требуется.');
      finish();
      return;
    }

    console.log('Добавляем столбец `password` в таблицу users…');
    db.run('ALTER TABLE users ADD COLUMN password TEXT', (alterErr) => {
      if (alterErr) {
        console.error('Ошибка при добавлении столбца password:', alterErr);
        process.exit(1);
      }
      console.log('Столбец `password` успешно добавлен.');
      finish();
    });
  });
}

function finish() {
  db.close(() => process.exit(0));
}

migrate();