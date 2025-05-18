const db = require('../db/initDB'); // Путь к вашему модулю инициализации БД

async function runMigration() {
  try {
    // 1. Добавляем столбец `parent_id`, если его нет
    await db.run(`
      ALTER TABLE Departments ADD COLUMN parent_id INTEGER REFERENCES Departments(id);
    `);
    console.log('Столбец parent_id добавлен.');

    // 2. Находим или создаем корневое подразделение с кодом "зуп-000"
    let rootDept = await db.get(
      'SELECT id FROM Departments WHERE code_zup = ?',
      ['зуп-000']
    );

    if (!rootDept) {
      const { lastID } = await db.run(
        `INSERT INTO Departments (name, fullname, code_zup, organization, parent_id) 
         VALUES (?, ?, ?, ?, NULL)`,
        ['Корневое подразделение', 'Корневое подразделение', 'зуп-000', 'НСРЗ']
      );
      rootDept = { id: lastID };
      console.log('Создано корневое подразделение с кодом "зуп-000".');
    }

    // 3. Обновляем все подразделения, устанавливая parent_id = корневому
    await db.run(
      'UPDATE Departments SET parent_id = ? WHERE parent_id IS NULL AND id != ?',
      [rootDept.id, rootDept.id]
    );
    console.log('Поле parent_id заполнено для всех подразделений.');

  } catch (err) {
    console.error('Ошибка миграции:', err);
  } finally {
    db.close(); // Закрываем соединение с БД
  }
}

runMigration();
