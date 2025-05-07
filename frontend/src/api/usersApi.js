import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

export const getUsers = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const createUser = async (userData) => {
  return axios.post(API_URL, userData);
};

export const updateUser = async (id, userData) => {
  return axios.put(`${API_URL}/${id}`, userData);
};

export const deleteUser = async (id) => {
  return axios.delete(`${API_URL}/${id}`);
};

export const getUserById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data || null;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
};