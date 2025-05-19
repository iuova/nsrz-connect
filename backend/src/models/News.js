import db from '../db/initDB.js';

class News {
  static async getAll(publishedOnly = false) {
    return new Promise((resolve, reject) => {
      const where = publishedOnly ? 'WHERE published = 1' : '';
      db.all(`SELECT * FROM news ${where} ORDER BY date DESC`, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  static async create({ title, content, published = false }) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO news (title, content, published) VALUES (?, ?, ?)',
        [title, content, published],
        function(err) {
          if (err) return reject(err);
          resolve({ id: this.lastID, title, content, published });
        }
      );
    });
  }

  static async update(id, { title, content, published }) {
    const news = await this.findById(id);
    if (!news) {
      throw new Error('Новость не найдена');
    }

    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE news SET title = ?, content = ?, published = ? WHERE id = ?',
        [title, content, published, id],
        function(err) {
          if (err) return reject(err);
          resolve(this.changes > 0);
        }
      );
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM news WHERE id = ?', [id], function(err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM news WHERE id = ?', [id], (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    });
  }
}

export default News;
