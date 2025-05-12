import db from '../db/initDB.js';

class Position {
  static async create({ name, department_id }) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO positions (name, department_id) VALUES (?, ?)`,
        [name, department_id],
        function(err) {
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });
  }

  static async getAll() {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT p.*, d.name as department_name 
        FROM positions p
        JOIN Departments d ON p.department_id = d.id
      `, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  // Найти должность по ID
  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT p.*, d.name as department_name 
        FROM positions p
        JOIN Departments d ON p.department_id = d.id
        WHERE p.id = ?
      `, [id], (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    });
  }

  // Обновить должность
  static async update(id, { name, department_id }) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE positions SET name = ?, department_id = ? WHERE id = ?`,
        [name, department_id, id],
        function(err) {
          if (err) return reject(err);
          resolve(this.changes > 0);
        }
      );
    });
  }

  // Удалить должность
  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM positions WHERE id = ?`,
        [id],
        function(err) {
          if (err) return reject(err);
          resolve(this.changes > 0);
        }
      );
    });
  }
}

export default Position;