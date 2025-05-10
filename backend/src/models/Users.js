import db from '../db/initDB.js';
import bcrypt from 'bcryptjs'; // Используем bcryptjs

class User {
  static create({ email, password, lastname, firstname, midlename, role, status, department }, callback) {
    console.log('Вызов User.create с параметрами:', {
      email,
      lastname,
      firstname,
      midlename,
      role,
      status,
      department,
      password: password ? '[длина: ' + password.length + ']' : undefined
    });
    
    // Проверяем, что department - это число (id подразделения)
    if (typeof department !== 'number' || isNaN(department)) {
      console.error('Ошибка типа department:', typeof department, department);
      return callback(new Error('Department must be an ID (integer)'));
    }

    // Проверка длины пароля
    if (!password || password.length < 3) {
      console.error('Ошибка пароля: слишком короткий пароль');
      return callback(new Error('Пароль должен содержать минимум 3 символа'));
    }

    // Предварительная проверка: выводим в консоль информацию о структуре таблицы
    db.all("PRAGMA table_info(users);", [], (pragmaErr, columns) => {
      if (pragmaErr) {
        console.error('Ошибка при получении информации о таблице:', pragmaErr);
      } else {
        console.log('Структура таблицы users:', columns);
      }
      
      // Проверка, существует ли email
      db.get('SELECT id FROM users WHERE email = ?', [email], (emailErr, existingUser) => {
        if (emailErr) {
          console.error('Ошибка при проверке email:', emailErr);
          return callback(emailErr);
        }
        
        if (existingUser) {
          console.error('Email уже используется:', email);
          return callback(new Error(`Email ${email} уже используется`));
        }
        
        // Проверка существования департамента
        db.get('SELECT id FROM Departments WHERE id = ?', [department], (deptErr, dept) => {
          if (deptErr) {
            console.error('Ошибка при проверке департамента:', deptErr);
            return callback(deptErr);
          }
          
          if (!dept) {
            console.error('Департамент не найден:', department);
            return callback(new Error(`Департамент с ID ${department} не существует`));
          }
          
          // Хэшируем пароль перед сохранением
          bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
              console.error('Ошибка хеширования пароля:', err);
              return callback(err);
            }

            console.log('Пароль успешно хэширован, длина хэша:', hash.length);

            const sql = `INSERT INTO users (email, password, lastname, firstname, midlename, role, status, department) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            const params = [email, hash, lastname, firstname, midlename, role, status, department];
            
            console.log('Выполнение SQL-запроса на создание пользователя с параметрами:', 
              [email, '***[HASH]***', lastname, firstname, midlename, role, status, department]);
              
            db.run(sql, params, function(err) {
              if (err) {
                console.error('Ошибка выполнения SQL-запроса:', err);
                console.error('Код ошибки:', err.code);
                console.error('Сообщение ошибки:', err.message);
                
                // Проверяем ограничения внешнего ключа
                if (err.code === 'SQLITE_CONSTRAINT') {
                  console.log('Проверка существования департамента:', department);
                  db.get('SELECT * FROM Departments WHERE id = ?', [department], (depErr, dept) => {
                    if (depErr) {
                      console.error('Ошибка при проверке департамента:', depErr);
                    } else {
                      console.log('Результат проверки департамента:', dept);
                    }
                  });
                  
                  // Проверка уникальности email
                  db.get('SELECT * FROM users WHERE email = ?', [email], (emailErr, user) => {
                    if (emailErr) {
                      console.error('Ошибка при проверке email:', emailErr);
                    } else {
                      console.log('Результат проверки email:', user);
                    }
                  });
                }
              } else {
                console.log('Пользователь создан успешно, ID:', this.lastID);
              }
              callback(err, this.lastID);
            });
          });
        });
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
    // Проверяем, что department - это число (id подразделения)
    if (typeof department !== 'number' || isNaN(department)) {
      return callback(new Error('Department must be an ID (integer)'));
    }
    
    // Сначала проверяем существование пользователя
    this.findById(id, (err, user) => {
      if (err) {
        console.error('Ошибка при поиске пользователя:', err);
        return callback(err);
      }
      
      if (!user) {
        console.error('Пользователь не найден:', id);
        return callback(new Error(`Пользователь с ID ${id} не найден`));
      }
      
      // Проверка существования департамента
      db.get('SELECT id FROM Departments WHERE id = ?', [department], (deptErr, dept) => {
        if (deptErr) {
          console.error('Ошибка при проверке департамента:', deptErr);
          return callback(deptErr);
        }
        
        if (!dept) {
          console.error('Департамент не найден:', department);
          return callback(new Error(`Департамент с ID ${department} не существует`));
        }
        
        // Проверка email на уникальность (только если он изменился)
        if (email && email !== user.email) {
          db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, id], (emailErr, existingUser) => {
            if (emailErr) {
              console.error('Ошибка при проверке email:', emailErr);
              return callback(emailErr);
            }
            
            if (existingUser) {
              console.error('Email уже используется другим пользователем:', email);
              return callback(new Error(`Email ${email} уже используется другим пользователем`));
            }
            
            // Продолжаем обновление с проверкой пароля
            this._finalizeUpdate(id, { email, password, lastname, firstname, midlename, role, status, department }, user, callback);
          });
        } else {
          // Если email не изменился, просто продолжаем обновление
          this._finalizeUpdate(id, { email: email || user.email, password, lastname, firstname, midlename, role, status, department }, user, callback);
        }
      });
    });
  }
  
  static _finalizeUpdate(id, { email, password, lastname, firstname, midlename, role, status, department }, user, callback) {
    // Если пароль не передан или пустой, используем существующий
    if (!password) {
      console.log('Пароль не изменен, используем существующий');
      const sql = `UPDATE users SET email = ?, lastname = ?, firstname = ?, midlename = ?, role = ?, status = ?, department = ? WHERE id = ?`;
      db.run(sql, [email, lastname, firstname, midlename, role, status, department, id], function(err) {
        if (err) {
          console.error('Ошибка обновления пользователя:', err);
          console.error('Код ошибки:', err.code);
          console.error('Сообщение ошибки:', err.message);
        } else {
          console.log('Пользователь обновлен успешно, ID:', id);
        }
        callback(err);
      });
    } else {
      // Если пароль передан, хэшируем его
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          console.error('Ошибка хеширования пароля:', err);
          return callback(err);
        }
        
        console.log('Пароль успешно хэширован при обновлении, длина хэша:', hash.length);
        
        const sql = `UPDATE users SET email = ?, password = ?, lastname = ?, firstname = ?, midlename = ?, role = ?, status = ?, department = ? WHERE id = ?`;
        db.run(sql, [email, hash, lastname, firstname, midlename, role, status, department, id], function(err) {
          if (err) {
            console.error('Ошибка обновления пользователя:', err);
            console.error('Код ошибки:', err.code);
            console.error('Сообщение ошибки:', err.message);
          } else {
            console.log('Пользователь обновлен успешно с новым паролем, ID:', id);
          }
          callback(err);
        });
      });
    }
  }

  static delete(id, callback) {
    const sql = `DELETE FROM users WHERE id = ?`;
    db.run(sql, [id], callback);
  }
}

export default User;