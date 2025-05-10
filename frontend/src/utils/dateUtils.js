/**
 * Форматирует дату в локализованный формат для отображения
 * @param {Date} date - объект даты для форматирования
 * @param {boolean} includeTime - включать ли время в форматированную строку
 * @returns {string} - отформатированная строка даты
 */
export const formatDate = (date, includeTime = true) => {
  if (!date) return 'Нет данных';
  
  try {
    // Проверяем, является ли дата допустимым объектом Date
    if (isNaN(date.getTime())) return 'Некорректная дата';
    
    // Настройки форматирования
    const options = {
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    };
    
    // Добавляем время, если оно требуется
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    // Форматируем дату с локализацией для России
    return date.toLocaleDateString('ru-RU', options);
  } catch (err) {
    console.error('Ошибка форматирования даты:', err);
    return 'Ошибка форматирования';
  }
};

/**
 * Получает относительную строку времени (например, "5 минут назад")
 * @param {Date|string} date - дата для форматирования
 * @returns {string} - относительная строка времени
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  
  try {
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Проверяем валидность даты
    if (isNaN(dateObj.getTime())) return '';
    
    const seconds = Math.floor((now - dateObj) / 1000);
    
    // Меньше минуты
    if (seconds < 60) return 'только что';
    
    // Меньше часа
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} ${getWordForm(minutes, ['минуту', 'минуты', 'минут'])} назад`;
    }
    
    // Меньше дня
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} ${getWordForm(hours, ['час', 'часа', 'часов'])} назад`;
    }
    
    // Меньше недели
    const days = Math.floor(hours / 24);
    if (days < 7) {
      return `${days} ${getWordForm(days, ['день', 'дня', 'дней'])} назад`;
    }
    
    // Больше недели - возвращаем полную дату
    return formatDate(dateObj);
  } catch (err) {
    console.error('Ошибка получения относительного времени:', err);
    return '';
  }
};

/**
 * Вспомогательная функция для выбора правильной формы слова в зависимости от числа
 * @param {number} number - число для проверки
 * @param {Array<string>} words - массив форм слова [для 1, для 2-4, для 5-9,0]
 * @returns {string} - правильная форма слова
 */
const getWordForm = (number, words) => {
  const cases = [2, 0, 1, 1, 1, 2];
  return words[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[Math.min(number % 10, 5)]];
}; 