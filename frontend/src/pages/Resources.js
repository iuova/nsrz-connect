import React, { useState, useEffect } from 'react';
import './Resources.css';

const Resources = () => {
  const [vacationData, setVacationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Временные данные
    const mockData = {
      employee: 'Иванов Иван Иванович',
      position: 'Инженер',
      vacationDays: {
        remaining: 14,
        used: 14,
        total: 28
      },
      nextVacation: '15.06.2024'
    };

    setTimeout(() => {
      setVacationData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div className="loading">Загрузка данных...</div>;
  }

  return (
    <div className="resources">
      <h1>Ресурсы сотрудника</h1>
      
      <div className="vacation-info">
        <div className="employee-card">
          <h2>{vacationData.employee}</h2>
          <p className="position">{vacationData.position}</p>
        </div>

        <div className="vacation-stats">
          <div className="stat-card">
            <h3>Осталось дней отпуска</h3>
            <div className="stat-value">{vacationData.vacationDays.remaining}</div>
          </div>
          
          <div className="stat-card">
            <h3>Использовано дней</h3>
            <div className="stat-value">{vacationData.vacationDays.used}</div>
          </div>
          
          <div className="stat-card">
            <h3>Всего дней в году</h3>
            <div className="stat-value">{vacationData.vacationDays.total}</div>
          </div>
        </div>

        <div className="next-vacation">
          <h3>Следующий отпуск</h3>
          <p>{vacationData.nextVacation}</p>
        </div>
      </div>
    </div>
  );
};

export default Resources; 