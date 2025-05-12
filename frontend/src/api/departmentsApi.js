import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
const API_URL = `${API_BASE}/api/departments`;

export const getDepartments = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
};

export const getDepartmentById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data || null;
  } catch (error) {
    console.error('Error fetching department:', error);
    return null;
  }
};

export const checkDepartmentUsage = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}/usage`);
    return response.data?.inUse || false;
  } catch (error) {
    console.error('Error checking department usage:', error);
    return true;
  }
};

export const createDepartment = async (departmentData) => {
  try {
    const response = await axios.post(API_URL, departmentData);
    return response.data;
  } catch (error) {
    console.error('Error creating department:', error);
    throw error;
  }
};

export const updateDepartment = async (id, departmentData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, departmentData);
    return response.data;
  } catch (error) {
    console.error('Error updating department:', error);
    throw error;
  }
};

export const deleteDepartment = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error('Error deleting department:', error);
    throw error;
  }
};
