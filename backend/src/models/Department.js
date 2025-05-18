import db from '../db/initDB.js';

class Department {
  /**
   * Создать новый отдел
   * @param {Object} departmentData - Данные отдела
   * @param {string} departmentData.name - Краткое название
   * @param {string} departmentData.fullname - Полное название
   * @param {string} departmentData.code_zup - Код в системе ЗУП
   * @param {string} departmentData.organization - Организация
   * @param {number|null} departmentData.parent_id - ID родительского подразделения
   * @returns {Promise<number>} ID созданного отдела
   */
  static async create({ name, fullname, code_zup, organization, parent_id = null }) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO Departments (name, fullname, code_zup, organization, parent_id) VALUES (?, ?, ?, ?, ?)`,
        [name, fullname, code_zup, organization, parent_id],
        function(err) {
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });
  }

  /**
   * Получить все отделы
   * @returns {Promise<Array>} Список отделов
   */
  static async getAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM Departments', [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  /**
   * Найти отдел по ID
   * @param {number} id - ID отдела
   * @returns {Promise<Object|null>} Объект отдела или null
   */
  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM Departments WHERE id = ?', [id], (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    });
  }

  /**
   * Обновить данные отдела
   * @param {number} id - ID отдела
   * @param {Object} updates - Обновляемые поля
   * @returns {Promise<boolean>} Успешность операции
   */
  static async update(id, { name, fullname, code_zup, organization }) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE Departments SET 
          name = ?, 
          fullname = ?, 
          code_zup = ?, 
          organization = ? 
         WHERE id = ?`,
        [name, fullname, code_zup, organization, id],
        function(err) {
          if (err) return reject(err);
          resolve(this.changes > 0);
        }
      );
    });
  }

  /**
   * Удалить отдел
   * @param {number} id - ID отдела
   * @returns {Promise<boolean>} Успешность операции
   */
  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM Departments WHERE id = ?', [id], function(err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      });
    });
  }

  /**
   * Получить все подразделения с сотрудниками
   * @returns {Promise<Array>} Список подразделений с сотрудниками
   */
  static async getAllWithEmployees() {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          d.id, 
          d.name, 
          d.fullname, 
          d.code_zup, 
          d.organization,
          e.id as employee_id,
          e.lastname,
          e.firstname,
          e.middlename,
          e.position_id,
          p.name as position_name
        FROM Departments d
        LEFT JOIN employees e ON e.department_id = d.id
        LEFT JOIN positions p ON e.position_id = p.id
      `, [], (err, rows) => {
        if (err) return reject(err);

        // Группировка сотрудников по подразделениям
        const departmentsMap = {};
        rows.forEach(row => {
          if (!departmentsMap[row.id]) {
            departmentsMap[row.id] = {
              id: row.id,
              name: row.name,
              fullname: row.fullname,
              code_zup: row.code_zup,
              organization: row.organization,
              employees: []
            };
          }
          if (row.employee_id) {
            departmentsMap[row.id].employees.push({
              id: row.employee_id,
              lastname: row.lastname,
              firstname: row.firstname,
              middlename: row.middlename,
              position_id: row.position_id,
              position_name: row.position_name
            });
          }
        });

        resolve(Object.values(departmentsMap));
      });
    });
  }

  /**
   * Получить подразделения с иерархией
   * @returns {Promise<Array>} Иерархический список подразделений
   */
  static async getHierarchy() {
    return new Promise((resolve, reject) => {
      db.all(`
        WITH RECURSIVE DeptTree AS (
          SELECT id, name, parent_id, 0 AS level
          FROM Departments
          WHERE parent_id IS NULL
          UNION ALL
          SELECT d.id, d.name, d.parent_id, dt.level + 1
          FROM Departments d
          JOIN DeptTree dt ON d.parent_id = dt.id
        )
        SELECT * FROM DeptTree ORDER BY level, name
      `, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
}

export default Department; 