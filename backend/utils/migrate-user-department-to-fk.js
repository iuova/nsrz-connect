import db from '../src/db/initDB.js';

async function migrate() {
  console.log('Начинаем миграцию: преобразование department в внешний ключ...');

  // Получаем информацию о колонках таблицы users
  const columns = await new Promise((resolve, reject) => {
    db.all(
      "PRAGMA table_info(users)",
      [],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []); // Гарантируем, что rows - это массив
        }
      }
    );
  });

  // Проверяем, нужно ли обновлять таблицу
  const needsMigration = !columns.some(col => col.name === 'department' && col.type === 'INTEGER');
  if (needsMigration) {
    console.log('Добавляем временное поле department_new...');
    await new Promise((resolve, reject) => {
      db.run(
        "ALTER TABLE users ADD COLUMN department_new INTEGER",
        [],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    console.log('Переносим данные из department в department_new...');
    await new Promise((resolve, reject) => {
      db.run(
        "UPDATE users SET department_new = CAST(department AS INTEGER) WHERE department IS NOT NULL",
        [],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    console.log('Удаляем старое поле department...');
    await new Promise((resolve, reject) => {
      db.run(
        "ALTER TABLE users RENAME TO users_old",
        [],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    console.log('Создаем новую таблицу users с внешним ключом...');
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL,
          password TEXT NOT NULL,
          lastname TEXT NOT NULL,
          firstname TEXT NOT NULL,
          midlename TEXT,
          role TEXT NOT NULL,
          status TEXT NOT NULL,
          department INTEGER,
          FOREIGN KEY (department) REFERENCES Departments(id)
        )
      `, [], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('Переносим данные из users_old в users...');
    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO users SELECT id, email, password, lastname, firstname, midlename, role, status, department_new FROM users_old",
        [],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    console.log('Удаляем временную таблицу users_old...');
    await new Promise((resolve, reject) => {
      db.run(
        "DROP TABLE users_old",
        [],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  } else {
    console.log('Поле department уже имеет тип INTEGER и внешний ключ – миграция не требуется.');
  }

  finish();
}

function finish() {
  db.close(() => process.exit(0));
}

migrate(); 