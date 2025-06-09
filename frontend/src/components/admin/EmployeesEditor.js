import React, { useState, useEffect } from 'react';
import { createEmployee, updateEmployee } from '../../api/employeesApi';
import { getDepartments } from '../../api/departmentsApi';
import { getPositions } from '../../api/positionsApi';
import './EmployeesEditor.css';

const EmployeesEditor = ({ employee, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    lastname: employee?.lastname || '',
    firstname: employee?.firstname || '',
    middlename: employee?.middlename || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    birth_date: employee?.birth_date || '',
    hire_date: employee?.hire_date || '',
    dismissal_date: employee?.dismissal_date || '',
    department_id: employee?.department_id || '',
    position_id: employee?.position_id || ''
  });

  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [departmentsData, positionsData] = await Promise.all([
          getDepartments(),
          getPositions()
        ]);
        setDepartments(departmentsData);
        setPositions(positionsData);
        if (!employee?.id) {
          if (departmentsData.length > 0) {
            setFormData(prev => ({ ...prev, department_id: departmentsData[0].id }));
          }
          if (positionsData.length > 0) {
            setFormData(prev => ({ ...prev, position_id: positionsData[0].id }));
          }
        }
      } catch (error) {
        setError('Ошибка загрузки справочников');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [employee?.id]);

  useEffect(() => {
    if (employee?.id) {
      setFormData({
        lastname: employee.lastname || '',
        firstname: employee.firstname || '',
        middlename: employee.middlename || '',
        email: employee.email || '',
        phone: employee.phone || '',
        birth_date: employee.birth_date || '',
        hire_date: employee.hire_date || '',
        dismissal_date: employee.dismissal_date || '',
        department_id: employee.department_id || '',
        position_id: employee.position_id || ''
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const requiredFields = {
      lastname: 'Фамилия',
      firstname: 'Имя',
      department_id: 'Подразделение',
      position_id: 'Должность',
      hire_date: 'Дата приема',
    };
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field]) {
        setError(`Поле "${label}" обязательно для заполнения`);
        return;
      }
    }
    try {
      if (employee?.id) {
        await updateEmployee(employee.id, formData);
      } else {
        await createEmployee(formData);
      }
      onSave();
    } catch (error) {
      let errorMessage = 'Ошибка сохранения';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage);
    }
  };

  return (
    <div className="editor-modal">
      <form onSubmit={handleSubmit} className="editor-form">
        <button 
          type="button" 
          className="close-button" 
          onClick={onCancel} 
          aria-label="Закрыть"
        ></button>
        <h2>{employee?.id ? 'Сотрудник (редактирование)' : 'Сотрудник (создание)'}</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="name-row">
          <label>
            Фамилия:
            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Имя:
            <input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Отчество:
            <input
              type="text"
              name="middlename"
              value={formData.middlename}
              onChange={handleChange}
            />
          </label>
        </div>
        <div className="form-groups-container">
          <div className="form-group form-group-department">
            <label>
              Подразделение:
              <select
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                required
                disabled={loading}
                className="select-placeholder"
              >
                <option value="" disabled>Выберите подразделение</option>
                {loading && <option value="" disabled>Загрузка...</option>}
                {!loading && departments.length === 0 && (
                  <option value="" disabled>Нет доступных подразделений</option>
                )}
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-group form-group-position">
            <label>
              Должность:
              <select
                name="position_id"
                value={formData.position_id}
                onChange={handleChange}
                required
                disabled={loading}
                className="select-placeholder"
              >
                <option value="" disabled>Выберите должность</option>
                {loading && <option value="" disabled>Загрузка...</option>}
                {!loading && positions.length === 0 && (
                  <option value="" disabled>Нет доступных должностей</option>
                )}
                {positions.map(pos => (
                  <option key={pos.id} value={pos.id}>
                    {pos.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-group form-group-email">
            <label>
              Email:
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                title="Введите корректный email адрес"
              />
            </label>
          </div>
          <div className="form-group form-group-phone">
            <label>
              Телефон:
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </label>
          </div>
          <div className="form-group form-group-birth-date">
            <label>
              Дата рождения:
              <input
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
              />
            </label>
          </div>
          <div className="form-group form-group-hire-date">
            <label>
              Дата приема:
              <input
                type="date"
                name="hire_date"
                value={formData.hire_date}
                onChange={handleChange}
                required
              />
            </label>
          </div>
          <div className="form-group form-group-dismissal-date">
            <label>
              Дата увольнения:
              <input
                type="date"
                name="dismissal_date"
                value={formData.dismissal_date}
                onChange={handleChange}
              />
            </label>
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-add">
            Сохранить
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            className="btn-cancel"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeesEditor;
