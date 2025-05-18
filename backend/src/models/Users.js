import db from '../db/initDB.js';
import bcrypt from 'bcryptjs'; // Используем bcryptjs

class User {
  static async create({ email, password, lastname, firstname, middlename, role, status, department_id }) {
    return new Promise((resolve, reject) => {
      if (!password) {
        return reject(new Error('Пароль обязателен'));
      }
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) return reject(err);
        
        const sql = `INSERT INTO users (email, password, lastname, firstname, middlename, role, status, department_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        db.run(sql, [email, hash, lastname, firstname, middlename, role, status, department_id], function(err) {
          if (err) {
            console.error('Ошибка SQL:', err);
            return reject(err);
          }
          resolve(this.lastID);
        });
      });
    });
  }

  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM users WHERE email = ?`;
      db.get(sql, [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static findAll(callback) {
    const sql = `SELECT * FROM users`;
    db.all(sql, [], callback);
  }

  static findById(id, callback) {
    const sql = `SELECT * FROM users WHERE id = ?`;
    db.get(sql, [id], callback);
  }

  static update(id, { email, password, lastname, firstname, middlename, role, status, department_id }, callback) {
    // Если пароль пустой, обновляем все поля кроме пароля
    if (!password) {
      const sql = `UPDATE users SET email = ?, lastname = ?, firstname = ?, middlename = ?, role = ?, status = ?, department_id = ? WHERE id = ?`;
      db.run(sql, [email, lastname, firstname, middlename, role, status, department_id, id], callback);
    } else {
      // Если пароль не пустой, хэшируем его и обновляем все поля
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) return callback(err);
        
        const sql = `UPDATE users SET email = ?, password = ?, lastname = ?, firstname = ?, middlename = ?, role = ?, status = ?, department_id = ? WHERE id = ?`;
        db.run(sql, [email, hash, lastname, firstname, middlename, role, status, department_id, id], callback);
      });
    }
  }

  static delete(id, callback) {
    const sql = `DELETE FROM users WHERE id = ?`;
    db.run(sql, [id], callback);
  }
}

export default User;