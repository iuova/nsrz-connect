import Position from '../src/models/Position.js';
import db from '../src/db/initDB.js';

const positionsData = [
  { name: 'Начальник отдела ОПС', department_id: 1, description: 'Руководитель подразделения' },
  { name: 'Начальник отдела ПЭО', department_id: 1, description: 'Руководитель подразделения' },
  { name: 'Инженер программист', department_id: 2, description: 'Разработка программного обеспечения' },
  { name: 'Экономист', department_id: 3, description: 'Анализ данных и требований' },
  { name: 'Тестировщик', department_id: 2, description: 'Тестирование ПО' },
  { name: 'Специалист по защите информации', department_id: 3, description: 'Защита информации' },
];

async function addPositions() {
  try {
    // Проверяем существующие должности
    const existingPositions = await new Promise((resolve, reject) => {
      db.all('SELECT name FROM positions', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => row.name));
      });
    });

    // Фильтруем новые должности
    const newPositions = positionsData.filter(
      position => !existingPositions.includes(position.name)
    );

    if (newPositions.length === 0) {
      console.log('Все должности уже добавлены в базу данных.');
      return;
    }

    // Добавляем новые должности
    for (const position of newPositions) {
      const positionId = await Position.create(position);
      console.log(`Должность "${position.name}" добавлена с ID: ${positionId}`);
    }
  } catch (err) {
    console.error('Ошибка при добавлении должностей:', err);
  } finally {
    db.close();
  }
}

addPositions();