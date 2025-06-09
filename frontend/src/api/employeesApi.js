import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

// Добавляем токен авторизации в заголовки
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const getEmployees = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/employees`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении списка сотрудников:', error);
    throw error;
  }
};

export const createEmployee = async (employeeData) => {
  try {
    const response = await axios.post(
      `${API_BASE}/api/employees`,
      employeeData,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании сотрудника:', error);
    throw error;
  }
};

export const updateEmployee = async (id, employeeData) => {
  try {
    const response = await axios.put(
      `${API_BASE}/api/employees/${id}`,
      employeeData,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error(`Ошибка при обновлении сотрудника с ID ${id}:`, error);
    throw error;
  }
};

export const deleteEmployee = async (id) => {
  try {
    const response = await axios.delete(
      `${API_BASE}/api/employees/${id}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error(`Ошибка при удалении сотрудника с ID ${id}:`, error);
    throw error;
  }
};
