import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import './Phonebook.css';

const Phonebook = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Временные данные
  const departments = [
    { id: 'all', name: 'Все отделы' },
    { id: 'management', name: 'Руководство' },
    { id: 'production', name: 'Производственный отдел' },
    { id: 'hr', name: 'Отдел кадров' }
  ];

  const employees = [
    { 
      id: 1, 
      name: 'Иванов Иван', 
      fullName: 'Иванов Иван Иванович',
      department: 'management', 
      departmentName: 'Руководство',
      position: 'Директор', 
      phone: '123-456',
      email: 'ivanov@nsrz.ru',
      status: 'active'
    },
    { 
      id: 2, 
      name: 'Петров Петр', 
      fullName: 'Петров Петр Петрович',
      department: 'production', 
      departmentName: 'Производственный отдел',
      position: 'Начальник цеха', 
      phone: '234-567',
      email: 'petrov@nsrz.ru',
      status: 'vacation'
    },
    { 
      id: 3, 
      name: 'Сидорова Анна', 
      fullName: 'Сидорова Анна Павловна',
      department: 'hr', 
      departmentName: 'Отдел кадров',
      position: 'HR-менеджер', 
      phone: '345-678',
      email: 'sidorova@nsrz.ru',
      status: 'sick'
    }
  ];

  const getStatusText = (status) => {
    const statusMap = {
      active: 'Активный',
      vacation: 'В отпуске',
      sick: 'Больничный',
      absent: 'Отсутствует'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    return `status-badge ${status}`;
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleRowClick = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  return (
    <div className="app">
      <Navbar />
      <div className="main-content">
        <div className="phonebook-container">
          <section className="hero">
            <h1>Справочник телефонов</h1>
            <p>Контактная информация сотрудников</p>
          </section>
          
          <div className="filters">
            <input
              type="text"
              placeholder="Поиск по имени..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="department-select"
            >
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="table-container">
            <table className="employees-table">
              <thead>
                <tr>
                  <th>Сотрудник</th>
                  <th>Должность</th>
                  <th>Подразделение</th>
                  <th>Телефон</th>
                  <th>Электронная почта</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(employee => (
                  <tr 
                    key={employee.id} 
                    onClick={() => handleRowClick(employee)}
                    className="table-row"
                  >
                    <td>{employee.name}</td>
                    <td>{employee.position}</td>
                    <td>{employee.departmentName}</td>
                    <td>{employee.phone}</td>
                    <td>{employee.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showModal && selectedEmployee && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="employee-modal" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={() => setShowModal(false)}>×</button>
                <h2>Информация о сотруднике</h2>
                <div className="employee-details">
                  <div className="detail-row">
                    <span className="detail-label">ФИО:</span>
                    <span className="detail-value">{selectedEmployee.fullName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Должность:</span>
                    <span className="detail-value">{selectedEmployee.position}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Подразделение:</span>
                    <span className="detail-value">{selectedEmployee.departmentName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Телефон:</span>
                    <span className="detail-value">{selectedEmployee.phone}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedEmployee.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Статус:</span>
                    <span className={getStatusClass(selectedEmployee.status)}>
                      {getStatusText(selectedEmployee.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Phonebook; 