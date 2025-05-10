import sqlite3 from 'sqlite3';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = `${__dirname}/../../database.sqlite`;

// Проверяем существование файла БД
if (!fs.existsSync(dbPath)) {
  console.log('Creating new database file...');
  fs.writeFileSync(dbPath, ''); // Создаем пустой файл
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database at', dbPath);
});

// Включаем поддержку foreign keys
db.run('PRAGMA foreign_keys = ON;', (err) => {
  if (err) {
    console.error('Error enabling foreign keys:', err);
  } else {
    console.log('Foreign keys enabled');
  }
});

// Проверка настроек foreign keys
db.get('PRAGMA foreign_keys;', [], (err, row) => {
  if (err) {
    console.error('Error checking foreign keys:', err);
  } else {
    console.log('Foreign keys setting:', row);
  }
});

// Единая схема таблиц
db.serialize(() => {
  // departments - создаем таблицу подразделений первой
  db.run(`CREATE TABLE IF NOT EXISTS Departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    fullname TEXT NOT NULL,
    code_zup TEXT NOT NULL,
    organization TEXT NOT NULL
  )`);
  
  // Проверка наличия тестового подразделения
  db.get("SELECT COUNT(*) as count FROM Departments", [], (err, row) => {
    if (err) {
      console.error('Error checking departments:', err);
    } else if (row && row.count === 0) {
      // Добавляем тестовый департамент если таблица пуста
      db.run(`INSERT INTO Departments (name, fullname, code_zup, organization) 
              VALUES ('TEST', 'Тестовый отдел', 'TST-001', 'Тестовая организация')`);
      console.log('Added test department');
    }
  });

  // news
  db.run(`CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    published BOOLEAN DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    createdBy INTEGER,
    FOREIGN KEY (createdBy) REFERENCES users(id)
  )`);
  
  // users
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    lastname TEXT NOT NULL,
    firstname TEXT NOT NULL,
    midlename TEXT,
    role TEXT NOT NULL,
    status TEXT NOT NULL,
    department INTEGER,
    FOREIGN KEY (department) REFERENCES Departments(id)
  )`);

  // Проверка структуры созданных таблиц
  console.log('Checking database structure...');
  db.all("PRAGMA table_info(users);", [], (err, rows) => {
    if (err) {
      console.error('Error checking users table structure:', err);
    } else {
      console.log('Users table structure:', rows);
    }
  });
  
  db.all("PRAGMA foreign_key_list(users);", [], (err, rows) => {
    if (err) {
      console.error('Error checking users foreign keys:', err);
    } else {
      console.log('Users foreign keys:', rows);
    }
  });
});

export default db;