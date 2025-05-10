import axios from 'axios';

const API_URL = 'http://localhost:5000/api/news';

export const getNews = async (showAll = false) => {
  try {
    const response = await axios.get(`${API_URL}${showAll ? '?all=true' : ''}`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};

export const createNews = async (newsData) => {
  console.log('createNews вызван с данными:', newsData);
  
  // Явно указываем заголовки для корректной обработки JSON
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  try {
    // Используем новый гарантированный маршрут вместо стандартного
    const response = await axios.post(`${API_URL}/guaranteed-create`, newsData, config);
    console.log('Результат запроса:', response.data);
    return response;
  } catch (error) {
    console.error('Ошибка создания новости в API:', error);
    console.error('Детали запроса:', {
      url: `${API_URL}/guaranteed-create`,
      data: newsData,
      headers: config.headers
    });
    throw error;
  }
};

// Стандартный метод создания (может не работать из-за проблемы с валидацией)
export const createNewsStandard = async (newsData) => {
  console.log('createNewsStandard вызван с данными:', newsData);
  
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  try {
    const response = await axios.post(API_URL, newsData, config);
    console.log('Результат запроса (стандартный):', response.data);
    return response;
  } catch (error) {
    console.error('Ошибка создания новости через стандартный API:', error);
    throw error;
  }
};

export const updateNews = async (id, newsData) => {
  // Явно указываем заголовки для корректной обработки JSON
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  return axios.put(`${API_URL}/${id}`, newsData, config);
};

export const deleteNews = async (id) => {
  return axios.delete(`${API_URL}/${id}`);
};

export const publishNews = async (id, shouldPublish = true) => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  return axios.patch(`${API_URL}/${id}/publish`, { published: shouldPublish }, config);
};

export const getLatestNews = async () => {
  try {
    const response = await axios.get('/api/news?published=true&limit=5');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching latest news:', error);
    return [];
  }
};