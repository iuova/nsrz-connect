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

// Единая схема таблиц
db.serialize(() => {
  // news
  db.run(`CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    published BOOLEAN DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
// users
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    lastname TEXT NOT NULL,
    firstname TEXT NOT NULL,
    midlename TEXT,
    role TEXT NOT NULL,
    status TEXT NOT NULL,
    department_id INTEGER NOT NULL,
    FOREIGN KEY (department_id) REFERENCES Departments(id)
  )`);

  // departments
  db.run(`CREATE TABLE IF NOT EXISTS Departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    fullname TEXT NOT NULL,
    code_zup TEXT NOT NULL,
    organization TEXT NOT NULL
  )`);

  // positions
  db.run(`CREATE TABLE IF NOT EXISTS positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    department_id INTEGER NOT NULL,
    FOREIGN KEY (department_id) REFERENCES Departments(id)
  )`);

  // employees
  db.run(`CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lastname TEXT NOT NULL,
    firstname TEXT NOT NULL,
    middlename TEXT,
    department_id INTEGER NOT NULL,
    position_id INTEGER NOT NULL,
    birth_date DATE NOT NULL,
    hire_date DATE NOT NULL,
    dismissal_date DATE,
    FOREIGN KEY (department_id) REFERENCES Departments(id),
    FOREIGN KEY (position_id) REFERENCES positions(id)
  )`);
});

export default db;