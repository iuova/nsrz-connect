import db from '../src/db/initDB.js';

db.all('PRAGMA table_info(users)', (err, rows) => {
  if (err) {
    console.error('Ошибка при получении схемы users:', err);
    process.exit(1);
  }

  if (rows.length === 0) {
    console.warn('Таблица users не найдена.');
  } else {
    console.log('Схема таблицы users:');
    console.table(
      rows.map((r) => ({
        cid: r.cid,
        name: r.name,
        type: r.type,
        notnull: !!r.notnull,
        dflt_value: r.dflt_value,
        pk: !!r.pk,
      })),
    );
  }

  db.close();
});