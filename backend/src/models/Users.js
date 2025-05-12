import db from '../db/initDB.js';
import bcrypt from 'bcryptjs'; // Используем bcryptjs

class User {
  static create({ email, password, lastname, firstname, midlename, role, status, department }, callback) {
    if (!password) {
      return callback(new Error('Пароль обязателен'));
    }
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return callback(err);
      const sql = `INSERT INTO users (email, password, lastname, firstname, midlename, role, status, department) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      db.run(sql, [email, hash, lastname, firstname, midlename, role, status, department], function(err) {
        if (err) {
          console.error('Ошибка SQL:', err);
          return callback(err);
        }
        callback(null, this.lastID);
      });
    });
  }

  static findByEmail(email, callback) {
    const sql = `SELECT * FROM users WHERE email = ?`;
    db.get(sql, [email], callback);
  }

  static findAll(callback) {
    const sql = `SELECT * FROM users`;
    db.all(sql, [], callback);
  }

  static findById(id, callback) {
    const sql = `SELECT * FROM users WHERE id = ?`;
    db.get(sql, [id], callback);
  }

  static update(id, { email, password, lastname, firstname, midlename, role, status, department }, callback) {
    // Если пароль пустой, обновляем все поля кроме пароля
    if (!password) {
      const sql = `UPDATE users SET email = ?, lastname = ?, firstname = ?, midlename = ?, role = ?, status = ?, department = ? WHERE id = ?`;
      db.run(sql, [email, lastname, firstname, midlename, role, status, department, id], callback);
    } else {
      // Если пароль не пустой, хэшируем его и обновляем все поля
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) return callback(err);
        
        const sql = `UPDATE users SET email = ?, password = ?, lastname = ?, firstname = ?, midlename = ?, role = ?, status = ?, department = ? WHERE id = ?`;
        db.run(sql, [email, hash, lastname, firstname, midlename, role, status, department, id], callback);
      });
    }
  }

  static delete(id, callback) {
    const sql = `DELETE FROM users WHERE id = ?`;
    db.run(sql, [id], callback);
  }
}

export default User;