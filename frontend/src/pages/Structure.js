import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import './Structure.css';
import { getDepartments, getDepartmentsHierarchy } from '../api/departmentsApi'; // Используем существующий метод

const Structure = () => {
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStructure = async () => {
      try {
        const departments = await getDepartmentsHierarchy(); // Новый метод API
        setStructure({
          name: 'НСРЗ',
          departments: buildTree(departments) // Функция для построения дерева
        });
      } catch (error) {
        console.error('Ошибка загрузки структуры:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStructure();
  }, []);

  // Вспомогательная функция для построения дерева
  const buildTree = (flatList) => {
    const map = {};
    const roots = [];
    flatList.forEach(item => {
      map[item.id] = { ...item, children: [] };
    });
    flatList.forEach(item => {
      if (item.parent_id) {
        map[item.parent_id].children.push(map[item.id]);
      } else {
        roots.push(map[item.id]);
      }
    });
    return roots;
  };

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