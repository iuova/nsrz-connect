const path = require('path');

const testRequire = (modulePath) => {
  try {
    const fullPath = path.resolve(modulePath);
    console.log(`Пытаемся загрузить: ${fullPath}`);
    const module = require(fullPath);
    console.log(`✅ Успешно: ${modulePath}`);
    return true;
  } catch (err) {
    console.error(`❌ Ошибка в ${modulePath}:`, err.message);
    return false;
  }
};

// Проверяем все критические модули
testRequire('./db/initDB');
testRequire('./models/News');
testRequire('./routes/news');
console.log("Версия express:", require('express').version);
console.log("better-sqlite3:", require('better-sqlite3') ? "OK" : "Ошибка");