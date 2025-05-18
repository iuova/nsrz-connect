import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import './Tabs.css';
import Pagination from '../common/Pagination';

const EmployeesTab = () => {
  const [excelData, setExcelData] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Создаем объект с переводом названий колонок
  const columnTranslations = {
    'id': 'Код',
    'lastname': 'Фамилия',
    'firstname': 'Имя',
    'middlename': 'Отчество',
    'birth_date': 'Дата рождения',
    'hire_date': 'Дата приема',
    'dismissal_date': 'Дата увольнения',
    'email': 'Email',
    'phone': 'Телефон',
    'position_name': 'Должность',
    'department_name': 'Подразделение'
  };

  // Функция для получения переведенного названия колонки
  const getTranslatedColumn = (key) => {
    return columnTranslations[key] || key;
  };

  // Обработка выбора файла
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const arrayBuffer = evt.target.result;
      const wb = XLSX.read(arrayBuffer, { type: 'array' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
      
      // Преобразуем числовые даты в читаемый формат
      const processedData = data.map(row => {
        // Переименовываем поле midle_name -> middlename (если есть)
        if (row.midle_name !== undefined) {
          row.middlename = row.midle_name;
          delete row.midle_name;
        }
        
        const dateFields = ['birth_date', 'hire_date', 'dismissal_date'];
        dateFields.forEach(field => {
          if (row[field] && typeof row[field] === 'number') {
            // Преобразуем Excel-дату в JS Date
            const excelDate = row[field];
            const jsDate = new Date((excelDate - (25567 + 1)) * 86400 * 1000);
            // Форматируем в YYYY-MM-DD
            row[field] = jsDate.toISOString().split('T')[0];
          }
        });
        return row;
      });
      
      setExcelData(processedData);
    };
    reader.readAsArrayBuffer(file);
  };

  // Загрузка сотрудников из базы
  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/employees');
      setEmployees(res.data);
    } catch (err) {
      setError('Ошибка загрузки сотрудников: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Отправка данных на backend
  const handleUpload = async () => {
    console.log('Отправляемые данные:', excelData); // для отладки
    try {
      setUploadStatus('Загрузка...');
      const response = await axios.post('/api/employees/bulk-upload', { employees: excelData });
      
      if (response.data.error) {
        // Обработка ошибок от сервера
        const errorDetails = response.data.details?.map(d => 
          `Строка ${d.emp}: ${d.error}`
        ).join('\n') || response.data.error;
        
        setUploadStatus(`Ошибка загрузки:\n${errorDetails}`);
      } else {
        setUploadStatus('Сотрудники успешно загружены!');
        setExcelData([]);
        fetchEmployees();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.details 
        ? err.response.data.details.map(d => d.error).join('\n')
        : err.response?.data?.error || err.message;
      setUploadStatus(`Ошибка: ${errorMsg}`);
    }
  };

  // Добавим функцию для сортировки
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Получение иконки сортировки
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'asc' ? '↓' : '↑';
  };

  // Сортировка данных
  const sortedData = React.useMemo(() => {
    let sortableItems = [...employees];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] === null) return sortConfig.direction === 'asc' ? 1 : -1;
        if (b[sortConfig.key] === null) return sortConfig.direction === 'asc' ? -1 : 1;
        
        if (typeof a[sortConfig.key] === 'string') {
          return sortConfig.direction === 'asc' 
            ? a[sortConfig.key].localeCompare(b[sortConfig.key])
            : b[sortConfig.key].localeCompare(a[sortConfig.key]);
        }
        return sortConfig.direction === 'asc' 
          ? a[sortConfig.key] - b[sortConfig.key] 
          : b[sortConfig.key] - a[sortConfig.key];
      });
    }
    return sortableItems;
  }, [employees, sortConfig]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <>
      <div className="actions-toolbar">
        <label className="btn-add">
          Выбрать файл
          <input 
            type="file" 
            accept=".xlsx,.xls" 
            onChange={handleFileUpload} 
            style={{ display: 'none' }}
          />
        </label>
        
        <button 
          onClick={handleUpload} 
          disabled={!excelData.length}
          className="btn-add"
        >
          Загрузить сотрудников
        </button>
        
        <div className="upload-status">{uploadStatus}</div>
      </div>

      {excelData.length > 0 && (
        <div className="table-wrapper">
          <h3>Предпросмотр загружаемых сотрудников</h3>
          <table className="users-table preview">
            <thead>
              <tr>
                {Object.keys(excelData[0])
                  .filter(key => !['department_id', 'position_id'].includes(key))
                  .map((key) => (
                    <th key={key}>{getTranslatedColumn(key)}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {excelData.map((row, idx) => (
                <tr key={idx} className="user-row">
                  {Object.entries(row)
                    .filter(([key]) => !['department_id', 'position_id'].includes(key))
                    .map(([key, val], i) => (
                      <td key={i}>{val}</td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="table-wrapper">
        <h3>Все сотрудники</h3>
        {loading ? (
          <div className="loading">Загрузка...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : employees.length === 0 ? (
          <div>Нет сотрудников в базе</div>
        ) : (
          <>
            <table className="users-table">
              <thead>
                <tr>
                  {Object.keys(employees[0])
                    .filter(key => !['department_id', 'position_id'].includes(key))
                    .map((key) => (
                      <th 
                        key={key} 
                        onClick={() => requestSort(key)}
                        className="sortable-column"
                      >
                        {getTranslatedColumn(key)} {getSortIcon(key)}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {currentItems.map((row, idx) => (
                  <tr key={idx} className="user-row">
                    {Object.entries(row)
                      .filter(([key]) => !['department_id', 'position_id'].includes(key))
                      .map(([key, val], i) => {
                        if (['birth_date', 'hire_date', 'dismissal_date'].includes(key) && val) {
                          return <td key={i}>{new Date(val).toLocaleDateString()}</td>;
                        }
                        return <td key={i}>{val}</td>;
                      })}
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              itemsCount={employees.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </>
  );
};

export default EmployeesTab; 