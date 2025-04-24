import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import './Structure.css';

const Structure = () => {
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Временная заглушка для структуры
    const mockStructure = {
      name: 'НСРЗ',
      departments: [
        {
          id: 1,
          name: 'Руководство',
          employees: [
            { id: 1, name: 'Иванов И.И.', position: 'Директор' }
          ]
        },
        {
          id: 2,
          name: 'Производственный отдел',
          employees: [
            { id: 2, name: 'Петров П.П.', position: 'Начальник отдела' },
            { id: 3, name: 'Сидоров С.С.', position: 'Инженер' }
          ]
        }
      ]
    };

    setTimeout(() => {
      setStructure(mockStructure);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="app">
        <Navbar />
        <div className="main-content">
          <div className="loading">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar />
      <div className="main-content">
        <div className="structure-container">
          <section className="hero">
            <h1>Структура предприятия</h1>
            <p>Организационная структура АО "НСРЗ"</p>
          </section>
          <div className="structure-tree">
            <div className="departments">
              {structure.departments.map(dept => (
                <div key={dept.id} className="department">
                  <div className="department-name">{dept.name}</div>
                  <div className="employees">
                    {dept.employees.map(emp => (
                      <div key={emp.id} className="employee">
                        <div className="employee-name">{emp.name}</div>
                        <div className="employee-position">{emp.position}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Structure; 