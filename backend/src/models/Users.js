import db from '../db/initDB.js';
import bcrypt from 'bcryptjs'; // Используем bcryptjs

class User {
  static create({ email, password, lastname, firstname, midlename, role, status, department }, callback) {
    // Проверяем, что department - это число (id подразделения)
    if (typeof department !== 'number') {
      return callback(new Error('Department must be an ID (integer)'));
    }

    // Хэшируем пароль перед сохранением
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return callback(err);

      const sql = `INSERT INTO users (email, password, lastname, firstname, midlename, role, status, department) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      db.run(sql, [email, hash, lastname, firstname, midlename, role, status, department], function(err) {
        callback(err, this.lastID);
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
    const sql = `UPDATE users SET email = ?, password = ?, lastname = ?, firstname = ?, midlename = ?, role = ?, status = ?, department = ? WHERE id = ?`;
    db.run(sql, [email, password, lastname, firstname, midlename, role, status, department, id], callback);
  }

  static delete(id, callback) {
    const sql = `DELETE FROM users WHERE id = ?`;
    db.run(sql, [id], callback);
  }
}

export default User;