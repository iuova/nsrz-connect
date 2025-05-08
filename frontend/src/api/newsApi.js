import axios from 'axios';

const API_URL = 'http://localhost:5000/api/news';

export const getNews = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};

export const createNews = async (newsData) => {
  return axios.post(API_URL, newsData);
};

export const updateNews = async (id, newsData) => {
  return axios.put(`${API_URL}/${id}`, newsData);
};

export const deleteNews = async (id) => {
  return axios.delete(`${API_URL}/${id}`);
};

export const publishNews = async (id) => {
  return axios.patch(`${API_URL}/${id}/publish`, { published: true });
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