import db from '../db/initDB.js';
import bcrypt from 'bcryptjs'; // Используем bcryptjs
import pkg from 'validator';
const { isEmail } = pkg;

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

  static async findAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    });
  }

  static async update(id, { email, password, lastname, firstname, middlename, role, status, department_id }) {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('Пользователь не найден');
    }

    if (email && !isEmail(email)) {
      throw new Error('Некорректный email');
    }

    return new Promise((resolve, reject) => {
      if (!password) {
        const sql = `UPDATE users SET email = ?, lastname = ?, firstname = ?, middlename = ?, role = ?, status = ?, department_id = ? WHERE id = ?`;
        db.run(sql, [email, lastname, firstname, middlename, role, status, department_id, id], function(err) {
          if (err) return reject(err);
          resolve(this.changes > 0);
        });
      } else {
        bcrypt.hash(password, 10, (err, hash) => {
          if (err) return reject(err);
          const sql = `UPDATE users SET email = ?, password = ?, lastname = ?, firstname = ?, middlename = ?, role = ?, status = ?, department_id = ? WHERE id = ?`;
          db.run(sql, [email, hash, lastname, firstname, middlename, role, status, department_id, id], function(err) {
            if (err) return reject(err);
            resolve(this.changes > 0);
          });
        });
      }
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      });
    });
  }
}

export default User;