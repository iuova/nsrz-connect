import db from '../db/initDB.js';

class News {
  static async getAll(publishedOnly = false) {
    const where = publishedOnly ? 'WHERE published = 1' : '';
    
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM news ${where} ORDER BY createdAt DESC`, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
  
  static async create(item) {
    console.log('News.create вызван с параметрами:', item);
    
    // Проверяем только обязательные поля title и content
    if (!item.title || !item.content) {
      console.error('Отсутствуют обязательные поля title или content');
      return Promise.reject(new Error('Title and content are required'));
    }
    
    return new Promise((resolve, reject) => {
      // Упрощенный запрос с минимальным количеством параметров
      const sql = "INSERT INTO news (title, content, published) VALUES (?, ?, ?)";
      const params = [item.title, item.content, item.published || 0];
      
      console.log('Выполняем SQL запрос:', sql);
      console.log('С параметрами:', params);
      
      db.run(sql, params, function(err) {
        if (err) {
          console.error('Ошибка создания новости:', err);
          reject(err);
        } else {
          console.log('Новость успешно создана, ID:', this.lastID);
          
          // После успешного создания запрашиваем созданную новость из базы
          db.get("SELECT * FROM news WHERE id = ?", [this.lastID], (err, row) => {
            if (err) {
              console.error('Ошибка при получении созданной новости:', err);
              // Но всё равно возвращаем успех, т.к. запись уже создана
              resolve({ 
                id: this.lastID, 
                title: item.title, 
                content: item.content, 
                published: item.published || 0
              });
            } else {
              console.log('Полученная из базы новость:', row);
              resolve(row);
            }
          });
        }
      });
    });
  }
  
  static async update(id, item) {
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE news SET title = ?, content = ? WHERE id = ?",
        [item.title, item.content, id],
        function(err) {
          if (err) {
            console.error('Ошибка обновления новости:', err);
            reject(err);
          } else {
            resolve({ id, ...item });
          }
        }
      );
    });
  }
  
  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run("DELETE FROM news WHERE id = ?", [id], (err) => {
        if (err) {
          console.error('Ошибка удаления новости:', err);
          reject(err);
        } else {
          resolve({ id });
        }
      });
    });
  }
  
  static async publish(id, shouldPublish) {
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE news SET published = ? WHERE id = ?",
        [shouldPublish ? 1 : 0, id],
        (err) => {
          if (err) {
            console.error('Ошибка публикации новости:', err);
            reject(err);
          } else {
            resolve({ id, published: shouldPublish });
          }
        }
      );
    });
  }
}

export default News;
