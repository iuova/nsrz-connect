import db from '../db/initDB.js';

class Employee {
  /**
   * Создать нового сотрудника
   * @param {Object} employeeData - Данные сотрудника
   * @param {string} employeeData.lastname - Фамилия
   * @param {string} employeeData.firstname - Имя
   * @param {string} employeeData.middlename - Отчество
   * @param {number} employeeData.department_id - ID отдела
   * @param {number} employeeData.position_id - ID должности
   * @param {string} employeeData.birth_date - Дата рождения
   * @param {string} employeeData.hire_date - Дата приема на работу
   * @param {string|null} employeeData.dismissal_date - Дата увольнения (опционально)
   * @returns {Promise<number>} ID созданного сотрудника
   */
  static async create({
    lastname,
    firstname,
    middlename,
    department_id,
    position_id,
    birth_date,
    hire_date,
    dismissal_date = null
  }) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO employees 
        (lastname, firstname, middlename, department_id, position_id, birth_date, hire_date, dismissal_date) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [lastname, firstname, middlename, department_id, position_id, birth_date, hire_date, dismissal_date],
        function(err) {
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });
  }

  /**
   * Получить всех сотрудников
   * @returns {Promise<Array>} Список сотрудников
   */
  static async getAll() {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT e.*, 
          d.name as department_name,
          p.name as position_name
        FROM employees e
        JOIN Departments d ON e.department_id = d.id
        JOIN positions p ON e.position_id = p.id
      `, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  /**
   * Найти сотрудника по ID
   * @param {number} id - ID сотрудника
   * @returns {Promise<Object|null>} Объект сотрудника или null
   */
  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM employees WHERE id = ?', [id], (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    });
  }

  /**
   * Обновить данные сотрудника
   * @param {number} id - ID сотрудника
   * @param {Object} updates - Обновляемые поля
   * @returns {Promise<boolean>} Успешность операции
   */
  static async update(id, {
    lastname,
    firstname,
    middlename,
    department_id,
    position_id,
    birth_date,
    hire_date,
    dismissal_date = null
  }) {
    const employee = await this.findById(id);
    if (!employee) {
      throw new Error('Сотрудник не найден');
    }

    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE employees SET 
          lastname = ?, 
          firstname = ?, 
          middlename = ?, 
          department_id = ?, 
          position_id = ?, 
          birth_date = ?, 
          hire_date = ?, 
          dismissal_date = ? 
        WHERE id = ?`,
        [lastname, firstname, middlename, department_id, position_id, birth_date, hire_date, dismissal_date, id],
        function(err) {
          if (err) return reject(err);
          resolve(this.changes > 0);
        }
      );
    });
  }

  /**
   * Удалить сотрудника
   * @param {number} id - ID сотрудника
   * @returns {Promise<boolean>} Успешность операции
   */
  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM employees WHERE id = ?', [id], function(err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      });
    });
  }

  /**
   * Получить всех сотрудников с информацией об отделе и должности
   * @returns {Promise<Array>} Список сотрудников
   */
  static async getAllWithEmployees() {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          e.id, 
          e.lastname, 
          e.firstname, 
          e.middlename, 
          e.department_id, 
          e.position_id, 
          e.birth_date, 
          e.hire_date, 
          e.dismissal_date,
          d.name as department_name,
          p.name as position_name
        FROM employees e
        JOIN Departments d ON e.department_id = d.id
        JOIN positions p ON e.position_id = p.id
      `, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
}

export default Employee;