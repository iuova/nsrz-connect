import React, { useState, useEffect } from 'react';
import { getDepartments, deleteDepartment } from '../../api/departmentsApi';
import DepartmentEditor from '../DepartmentEditor';
import Pagination from '../common/Pagination';

const DepartmentsTab = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingDept, setEditingDept] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const loadDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleDeleteDept = async () => {
    if (selectedItems.length === 0) {
      alert('Выберите подразделения для удаления');
      return;
    }
    
    if (window.confirm('Вы уверены, что хотите удалить выбранные подразделения?')) {
      try {
        // Удаляем все выбранные подразделения
        await Promise.all(selectedItems.map(id => deleteDepartment(id)));
        setDepartments(prev => prev.filter(dept => !selectedItems.includes(dept.id)));
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

  const handleRowDoubleClick = (dept) => {
    setEditingDept(dept);
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
    let sortableItems = [...departments];
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
  }, [departments, sortConfig]);

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
          onClick={() => setEditingDept({ 
            name: '', 
            fullname: '', 
            code_zup: '', 
            organization: '' 
          })}
          className="btn-add"
        >
          + Добавить подразделение
        </button>
        
        {selectedItems.length > 0 && (
          <>
            <button
              onClick={handleDeleteDept}
              className="btn-action btn-delete"
            >
              Удалить выбранные
            </button>
          </>
        )}
      </div>

      {editingDept && (
        <DepartmentEditor
          department={editingDept}
          onSave={() => {
            setEditingDept(null);
            loadDepartments();
            setSelectedItems([]);
            setSelectAll(false);
          }}
          onCancel={() => setEditingDept(null)}
        />
      )}

      <table className="departments-table">
        <thead>
          <tr>
            <th>
              <input 
                type="checkbox" 
                checked={selectAll}
                onChange={handleSelectAll}
              />
            </th>
            <th onClick={() => requestSort('name')} className="sortable-column">
              Название {getSortIcon('name')}
            </th>
            <th onClick={() => requestSort('fullname')} className="sortable-column">
              Полное название {getSortIcon('fullname')}
            </th>
            <th onClick={() => requestSort('code_zup')} className="sortable-column">
              Код ЗУП {getSortIcon('code_zup')}
            </th>
            <th onClick={() => requestSort('organization')} className="sortable-column">
              Организация {getSortIcon('organization')}
            </th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map(dept => (
            <tr 
              key={dept.id} 
              onDoubleClick={() => handleRowDoubleClick(dept)}
              className={`department-row ${selectedItems.includes(dept.id) ? 'selected' : ''}`}
            >
              <td>
                <input 
                  type="checkbox" 
                  checked={selectedItems.includes(dept.id)}
                  onChange={() => handleSelectItem(dept.id)}
                />
              </td>
              <td>{dept.name}</td>
              <td>{dept.fullname}</td>
              <td>{dept.code_zup}</td>
              <td>{dept.organization}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        itemsCount={departments.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </>
  );
};

export default DepartmentsTab; 