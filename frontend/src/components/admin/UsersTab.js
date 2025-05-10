import React, { useState, useEffect } from 'react';
import { getUsers, deleteUser } from '../../api/usersApi';
import UsersEditor from '../UsersEditor';
import Pagination from '../common/Pagination';

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

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
    loadUsers();
  }, []);

  const handleDeleteUser = async () => {
    if (selectedItems.length === 0) {
      alert('Выберите пользователей для удаления');
      return;
    }
    
    if (window.confirm('Вы уверены, что хотите удалить выбранных пользователей?')) {
      try {
        // Удаляем всех выбранных пользователей
        await Promise.all(selectedItems.map(id => deleteUser(id)));
        setUsers(prev => prev.filter(user => !selectedItems.includes(user.id)));
        setSelectedItems([]);
        setSelectAll(false);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentItems.map(item => item.id));
    }
    setSelectAll(!selectAll);
  };

  const handleRowDoubleClick = (user) => {
    setEditingUser(user);
  };

  // Функция для сортировки
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Получение иконки сортировки
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return '↕';
    }
    return sortConfig.direction === 'asc' ? '↓' : '↑';
  };

  // Сортировка данных
  const sortedData = React.useMemo(() => {
    let sortableItems = [...users];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] === null) return sortConfig.direction === 'asc' ? 1 : -1;
        if (b[sortConfig.key] === null) return sortConfig.direction === 'asc' ? -1 : 1;
        
        // Сортировка строк
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [users, sortConfig]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    // Сбрасываем выбор при смене страницы
    setSelectedItems([]);
    setSelectAll(false);
  }, [currentPage]);

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <>
      <div className="actions-toolbar">
        <button 
          onClick={() => setEditingUser({ 
            email: '', 
            password: '', 
            lastname: '', 
            firstname: '', 
            midlename: '', 
            role: 'user', 
            status: 'active', 
            department: '' 
          })}
          className="btn-add"
        >
          + Добавить пользователя
        </button>
        
        {selectedItems.length > 0 && (
          <>
            <button
              onClick={handleDeleteUser}
              className="btn-action btn-delete"
            >
              Удалить выбранных
            </button>
          </>
        )}
      </div>

      {editingUser && (
        <UsersEditor
          user={editingUser}
          onSave={() => {
            setEditingUser(null);
            loadUsers();
            setSelectedItems([]);
            setSelectAll(false);
          }}
          onCancel={() => setEditingUser(null)}
        />
      )}

      <table className="users-table">
        <thead>
          <tr>
            <th>
              <input 
                type="checkbox" 
                checked={selectAll}
                onChange={handleSelectAll}
              />
            </th>
            <th onClick={() => requestSort('lastname')} className="sortable-column">
              Фамилия {getSortIcon('lastname')}
            </th>
            <th onClick={() => requestSort('firstname')} className="sortable-column">
              Имя {getSortIcon('firstname')}
            </th>
            <th onClick={() => requestSort('midlename')} className="sortable-column">
              Отчество {getSortIcon('midlename')}
            </th>
            <th onClick={() => requestSort('email')} className="sortable-column">
              Email {getSortIcon('email')}
            </th>
            <th onClick={() => requestSort('role')} className="sortable-column">
              Роль {getSortIcon('role')}
            </th>
            <th onClick={() => requestSort('status')} className="sortable-column">
              Статус {getSortIcon('status')}
            </th>
            <th onClick={() => requestSort('department')} className="sortable-column">
              Отдел {getSortIcon('department')}
            </th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map(user => (
            <tr 
              key={user.id} 
              onDoubleClick={() => handleRowDoubleClick(user)}
              className={`user-row ${selectedItems.includes(user.id) ? 'selected' : ''}`}
            >
              <td>
                <input 
                  type="checkbox" 
                  checked={selectedItems.includes(user.id)}
                  onChange={() => handleSelectItem(user.id)}
                />
              </td>
              <td>{user.lastname}</td>
              <td>{user.firstname}</td>
              <td>{user.midlename}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.status}</td>
              <td>{user.department}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        itemsCount={users.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </>
  );
};

export default UsersTab; 