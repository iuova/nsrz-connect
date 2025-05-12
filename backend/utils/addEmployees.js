import Employee from '../src/models/Employee.js';
import db from '../src/db/initDB.js';

const employeesData = [
  {
    id: 1, // Уникальный ID сотрудника
    lastname: 'Иванов',
    firstname: 'Иван',
    middlename: 'Иванович',
    department_id: 1,
    position_id: 1,
    birth_date: '1980-01-01',
    hire_date: '2020-01-01',
    dismissal_date: null,
  },
  {
    id: 2,
    lastname: 'Петров',
    firstname: 'Петр',
    middlename: 'Петрович',
    department_id: 1,
    position_id: 2,
    birth_date: '1985-05-15',
    hire_date: '2021-03-10',
    dismissal_date: null,
  },
  {
    id: 3,
    lastname: 'Сидорова',
    firstname: 'Анна',
    middlename: 'Владимировна',
    department_id: 2,
    position_id: 3,
    birth_date: '1990-11-20',
    hire_date: '2022-07-05',
    dismissal_date: null,
  },
];

async function addEmployees() {
  try {
    // Проверяем существующих сотрудников по ID
    const existingIds = await new Promise((resolve, reject) => {
      db.all('SELECT id FROM employees', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => row.id));
      });
    });

    // Фильтруем новых сотрудников (если ID нет в базе)
    const newEmployees = employeesData.filter(
      employee => !existingIds.includes(employee.id)
    );

    if (newEmployees.length === 0) {
      console.log('Все сотрудники уже добавлены в базу данных.');
      return;
    }

    // Добавляем новых сотрудников
    for (const employee of newEmployees) {
      const employeeId = await Employee.create(employee);
      console.log(`Сотрудник ${employee.lastname} ${employee.firstname} добавлен с ID: ${employeeId}`);
    }
  } catch (err) {
    console.error('Ошибка при добавлении сотрудников:', err);
  } finally {
    db.close();
  }
}

addEmployees();