import React, { useState } from 'react';
import './Phonebook.css';

const Phonebook = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Временные данные
  const departments = [
    { id: 'all', name: 'Все отделы' },
    { id: 'management', name: 'Руководство' },
    { id: 'production', name: 'Производственный отдел' },
    { id: 'hr', name: 'Отдел кадров' }
  ];

  const contacts = [
    { id: 1, name: 'Иванов Иван', department: 'management', position: 'Директор', phone: '123-456' },
    { id: 2, name: 'Петров Петр', department: 'production', position: 'Начальник цеха', phone: '234-567' },
    { id: 3, name: 'Сидорова Анна', department: 'hr', position: 'HR-менеджер', phone: '345-678' }
  ];

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || contact.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="phonebook">
      <h1>Справочник телефонов</h1>
      
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

      <div className="contacts-list">
        {filteredContacts.map(contact => (
          <div key={contact.id} className="contact-card">
            <h3>{contact.name}</h3>
            <p className="position">{contact.position}</p>
            <p className="phone">📞 {contact.phone}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Phonebook; 