import React, { useState, useEffect } from 'react';
import { getUsers, deleteUser } from '../api/usersApi';
import UsersEditor from './UsersEditor';
import Pagination from './Pagination';
import '../pages/AdminPanel.css';

const UsersManagement = ({ isAdmin }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadUsers();
  }, [isAdmin]);

  const handleDeleteUser = async (id) => {
    if (!isAdmin) return;
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = users.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <>
      <button 
        onClick={() => setEditingUser({ 
          lastname: '', 
          firstname: '', 
          midlename: '', 
          role: '', 
          status: '', 
          department: '' 
        })}
        className="btn-add"
      >
        + Добавить пользователя
      </button>

      {editingUser && (
        <UsersEditor
          user={editingUser}
          onSave={() => {
            setEditingUser(null);
            loadUsers();
          }}
          onCancel={() => setEditingUser(null)}
        />
      )}

      <table className="users-table">
        <thead>
          <tr>
            <th>Фамилия</th>
            <th>Имя</th>
            <th>Отчество</th>
            <th>Роль</th>
            <th>Статус</th>
            <th>Отдел</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map(user => (
            <tr key={user.id}>
              <td>{user.lastname}</td>
              <td>{user.firstname}</td>
              <td>{user.midlename}</td>
              <td>{user.role}</td>
              <td>{user.status}</td>
              <td>{user.department}</td>
              <td>
                <button 
                  onClick={() => setEditingUser(user)}
                  className="btn-edit"
                >
                  Редактировать
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id)}
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
        totalItems={users.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </>
  );
};

export default UsersManagement; 