import bcrypt from 'bcryptjs';
import db from '../src/db/initDB.js';
import User from '../src/models/Users.js';

const SALT_ROUNDS = 10;

/* -------------------- вспомогательная парсилка CLI -------------------- */
function args() {
  const inp = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < inp.length; i += 2) {
    const key = inp[i].replace(/^--/, '');
    out[key] = inp[i + 1];
  }
  return out;
}

/* -------------------- основная логика -------------------- */
async function main() {
  const { email, id, password } = args();

  if (!password || (!email && !id)) {
    console.error('Использование: node resetUserPassword.js --email user@host --password NewPass');
    console.error('или:        node resetUserPassword.js --id 3 --password NewPass');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  // выбираем способ поиска
  const updateBy = email
    ? { field: 'email', value: email }
    : { field: 'id', value: id };

  const sql = `UPDATE users SET password = ? WHERE ${updateBy.field} = ?`;
  db.run(sql, [hash, updateBy.value], function (err) {
    db.close();
    if (err) {
      console.error('Ошибка обновления пароля:', err);
      process.exit(1);
    }
    if (this.changes === 0) {
      console.warn('Пользователь не найден.');
    } else {
      console.log('Пароль успешно обновлён.');
    }
    process.exit(0);
  });
}

main();