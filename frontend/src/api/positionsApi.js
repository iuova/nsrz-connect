import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const getPositions = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/positions`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении списка должностей:', error);
    throw error;
  }
};

export const getDepartments = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/departments`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении списка подразделений:', error);
    throw error;
  }
};
