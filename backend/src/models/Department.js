import db from '../db/initDB.js';

class Department {
  /**
   * Создать новый отдел
   * @param {Object} departmentData - Данные отдела
   * @param {string} departmentData.name - Краткое название
   * @param {string} departmentData.fullname - Полное название
   * @param {string} departmentData.code_zup - Код в системе ЗУП
   * @param {string} departmentData.organization - Организация
   * @returns {Promise<number>} ID созданного отдела
   */
  static async create({ name, fullname, code_zup, organization }) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO Departments (name, fullname, code_zup, organization) 
         VALUES (?, ?, ?, ?)`,
        [name, fullname, code_zup, organization],
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
}

export default Department; 