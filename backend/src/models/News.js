const db = require('../db/initDB');

module.exports = {
  getAll: (publishedOnly = false) => {
    const where = publishedOnly ? 'WHERE published = 1' : '';
    return db.prepare(`SELECT * FROM news ${where} ORDER BY createdAt DESC`).all();
  },
  create: (item) => {
    const { lastInsertRowid } = db.prepare(
      "INSERT INTO news (title, content, createdAt, createdBy) VALUES (?, ?, ?, ?)"
    ).run(item.title, item.content, item.createAt, item.createdBy);
    return { id: lastInsertRowid, ...item };
  }
};
