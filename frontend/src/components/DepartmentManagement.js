import React, { useState, useEffect } from 'react';
import { getDepartments, deleteDepartment } from '../api/departmentsApi';
import DepartmentEditor from './DepartmentEditor';
import Pagination from './Pagination';
import '../pages/AdminPanel.css';

const DepartmentManagement = ({ isAdmin }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const loadDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadDepartments();
    else setError('Доступ запрещен');
  }, [isAdmin]);

  const handleDeleteDepartment = async (id) => {
    if (!isAdmin) return;
    try {
      await deleteDepartment(id);
      setDepartments(prev => prev.filter(dept => dept.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = departments.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <>
      <button 
        onClick={() => setEditingDepartment({ name: '', fullname: '', code_zup: '', organization: '' })}
        className="btn-add"
      >
        + Добавить отдел
      </button>

      {editingDepartment && (
        <DepartmentEditor
          department={editingDepartment}
          onSave={() => {
            setEditingDepartment(null);
            loadDepartments();
          }}
          onCancel={() => setEditingDepartment(null)}
        />
      )}

      <table className="news-table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Полное название</th>
            <th>Код ЗУП</th>
            <th>Организация</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map(dept => (
            <tr key={dept.id}>
              <td>{dept.name}</td>
              <td>{dept.fullname}</td>
              <td>{dept.code_zup}</td>
              <td>{dept.organization}</td>
              <td>
                <button 
                  onClick={() => setEditingDepartment(dept)}
                  className="btn-edit"
                >
                  Редактировать
                </button>
                <button
                  onClick={() => handleDeleteDepartment(dept.id)}
                  className="btn-delete"
                >
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        totalItems={departments.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </>
  );
};

export default DepartmentManagement; 