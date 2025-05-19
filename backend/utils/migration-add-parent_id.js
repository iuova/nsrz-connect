import db from '../src/db/initDB.js';

async function runMigration() {
  try {
    // 1. Проверяем, существует ли столбец `parent_id`
    const columnExists = await db.get(`
      SELECT 1 FROM pragma_table_info('Departments') WHERE name = 'parent_id';
    `);

    if (!columnExists) {
      await db.run(`
        ALTER TABLE Departments ADD COLUMN parent_id INTEGER REFERENCES Departments(id);
      `);
      console.log('✅ Столбец parent_id успешно добавлен.');
    } else {
      console.log('ℹ️ Столбец parent_id уже существует. Пропускаем добавление.');
    }

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
      console.log('✅ Создано корневое подразделение с кодом "зуп-000".');
    } else {
      console.log('ℹ️ Корневое подразделение с кодом "зуп-000" уже существует.');
    }

    // 3. Обновляем все подразделения, устанавливая parent_id = корневому
    const { changes } = await db.run(
      'UPDATE Departments SET parent_id = ? WHERE parent_id IS NULL AND id != ?',
      [rootDept.id, rootDept.id]
    );
    console.log(`✅ Поле parent_id заполнено для ${changes} подразделений.`);

  } catch (err) {
    console.error('❌ Ошибка миграции:', err.message);
    process.exit(1); // Завершаем процесс с ошибкой
  } finally {
    db.close(); // Закрываем соединение с БД
    console.log('🔌 Соединение с базой данных закрыто.');
  }
}

runMigration();
