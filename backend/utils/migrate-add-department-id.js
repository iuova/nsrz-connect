import db from '../src/db/initDB.js';

async function migrate() {
  try {
    // 1. Проверяем существование столбца department_id
    const columns = await new Promise((resolve, reject) => {
      db.all('PRAGMA table_info(users)', (err, cols) => {
        if (err) reject(err);
        else resolve(cols);
      });
    });

    const hasDepartmentId = columns.some(c => c.name === 'department_id');
    if (hasDepartmentId) {
      console.log('Столбец department_id уже существует - миграция не требуется');
      return finish();
    }

    // 2. Добавляем столбец department_id
    await new Promise((resolve, reject) => {
      db.run('ALTER TABLE users ADD COLUMN department_id INTEGER', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('Столбец department_id успешно добавлен');

    // 3. Находим ID отдела "ПЭО" в таблице Departments
    const peoDepartment = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM Departments WHERE name = ?', ['ПЭО'], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!peoDepartment) {
      throw new Error('Отдел "ПЭО" не найден в таблице Departments');
    }

    // 4. Обновляем всех пользователей, устанавливая department_id = ID ПЭО
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET department_id = ? WHERE department_id IS NULL',
        [peoDepartment.id],
        function(err) {
          if (err) reject(err);
          else {
            console.log(`Обновлено ${this.changes} пользователей`);
            resolve();
          }
        }
      );
    });

    // 5. Добавляем FOREIGN KEY constraint
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE users_new AS 
        SELECT * FROM users
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    await new Promise((resolve, reject) => {
      db.run('DROP TABLE users', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

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
          department_id INTEGER NOT NULL,
          FOREIGN KEY (department_id) REFERENCES Departments(id)
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    await new Promise((resolve, reject) => {
      db.run('INSERT INTO users SELECT * FROM users_new', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    await new Promise((resolve, reject) => {
      db.run('DROP TABLE users_new', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('FOREIGN KEY constraint успешно добавлен');
  } catch (err) {
    console.error('Ошибка миграции:', err);
    process.exit(1);
  } finally {
    finish();
  }
}

function finish() {
  db.close(() => process.exit(0));
}

migrate();
