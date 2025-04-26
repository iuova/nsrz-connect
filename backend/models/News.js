const db = require('../db/initDB');

module.exports = {
  getAll: (publishedOnly = false) => {
    const where = publishedOnly ? 'WHERE published = 1' : '';
    return db.prepare(`SELECT * FROM news ${where} ORDER BY date DESC`).all();
  },
  create: (item) => {
    const { lastInsertRowid } = db.prepare(
      "INSERT INTO news (title, content) VALUES (?, ?)"
    ).run(item.title, item.content);
    return { id: lastInsertRowid, ...item };
  }
};
