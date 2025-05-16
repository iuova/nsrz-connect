import axios from 'axios';

const API_URL = 'http://localhost:5000/api/news';

export const getNews = async (showAll = false) => {
  try {
    const response = await axios.get(`${API_URL}${showAll ? '?all=true' : ''}`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching news:', error);
    // Provide more context about the error
    throw new Error(`Failed to fetch news: ${error.message}`);
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
/**
 * Toggle the published state of a news item
 * @param {number|string} id - The ID of the news item to publish/unpublish
 * @param {boolean} [shouldPublish=true] - Whether to publish (true) or unpublish (false)
 * @returns {Promise<Object>} The response data from the server
 */
export const publishNews = async (id, shouldPublish = true) => {
  return axios.patch(`${API_URL}/${id}/publish`, { published: shouldPublish });
};

export const getLatestNews = async () => {
  try {
    const response = await axios.get(`${API_URL}?published=true&limit=5`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching latest news:', error);
    return [];
  }
};