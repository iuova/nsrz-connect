import db from '../src/db/initDB.js';

function migrate() {
  db.all('PRAGMA table_info(news)', (err, columns) => {
    if (err) {
      console.error('Не удалось получить информацию о таблице news:', err);
      process.exit(1);
    }

    // Проверяем, существует ли поле createdBy
    const hasCreatedBy = columns.some((c) => c.name === 'createdBy');
    if (hasCreatedBy) {
      console.log('Столбец `createdBy` уже существует – миграция не требуется.');
    } else {
      console.log('Добавляем столбец `createdBy` в таблицу news…');
      db.run('ALTER TABLE news ADD COLUMN createdBy INTEGER', (alterErr) => {
        if (alterErr) {
          console.error('Ошибка при добавлении столбца createdBy:', alterErr);
          process.exit(1);
        }
        console.log('Столбец `createdBy` успешно добавлен.');
      });
    }

    // Проверяем, существует ли поле createdAt
    const hasCreatedAt = columns.some((c) => c.name === 'createdAt');
    if (hasCreatedAt) {
      console.log('Столбец `createdAt` уже существует – миграция не требуется.');
    } else {
      console.log('Добавляем столбец `createdAt` в таблицу news…');
      db.run('ALTER TABLE news ADD COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP', (alterErr) => {
        if (alterErr) {
          console.error('Ошибка при добавлении столбца createdAt:', alterErr);
          process.exit(1);
        }
        console.log('Столбец `createdAt` успешно добавлен.');
      });
    }

    finish();
  });
}

function finish() {
  db.close(() => process.exit(0));
}

migrate(); 