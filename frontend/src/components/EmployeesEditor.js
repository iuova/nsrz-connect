import React, { useState, useEffect } from 'react';
import { createEmployee, updateEmployee } from '../api/employeesApi';
import { getDepartments } from '../api/departmentsApi';
import { getPositions } from '../api/positionsApi';
import './EmployeesEditor.css';

const EmployeesEditor = ({ employee, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    code: '',
    lastname: '',
    firstname: '',
    middlename: '',
    birthdate: '',
    hire_date: '',
    termination_date: '',
    department_id: '',
    position_id: ''
  });

  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [depts, pos] = await Promise.all([
          getDepartments(),
          getPositions()
        ]);
        setDepartments(depts);
        setPositions(pos);
        if (!employee?.id && depts.length > 0 && pos.length > 0) {
          setFormData(prev => ({
            ...prev,
            department_id: depts[0].id,
            position_id: pos[0].id
          }));
        }
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
        setError('Ошибка загрузки подразделений или должностей');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [employee?.id]);

  useEffect(() => {
    if (employee?.id) {
      setFormData({
        code: employee.code || '',
        lastname: employee.lastname || '',
        firstname: employee.firstname || '',
        middlename: employee.middlename || '',
        birthdate: employee.birthdate || '',
        hire_date: employee.hire_date || '',
        termination_date: employee.termination_date || '',
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
      code: 'Код',
      lastname: 'Фамилия',
      firstname: 'Имя',
      birthdate: 'Дата рождения',
      hire_date: 'Дата приема',
      department_id: 'Подразделение',
      position_id: 'Должность'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field]) {
        setError(`Поле "${label}" обязательно для заполнения`);
        return;
      }
    }

    if (new Date(formData.birthdate) >= new Date(formData.hire_date)) {
      setError('Дата рождения должна быть раньше даты приема на работу');
      return;
    }

    try {
      if (employee?.id) {
        await updateEmployee(employee.id, formData);
      } else {
        await createEmployee(formData);
      }
      onSave();
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      setError(err.response?.data?.error || 'Ошибка сохранения данных');
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

        <h2>{employee?.id ? 'Редактирование сотрудника' : 'Создание сотрудника'}</h2>

        {error && <div className="error-message">{error}</div>}

        <div className="name-row">
          <label>
            Код:
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
            />
          </label>
        </div>

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
          <div className="form-group">
            <label>
              Дата рождения:
              <input
                type="date"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div className="form-group">
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

          <div className="form-group">
            <label>
              Дата увольнения:
              <input
                type="date"
                name="termination_date"
                value={formData.termination_date}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="form-group">
            <label>
              Подразделение:
              <select
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                required
                disabled={loading}
              >
                {loading && <option>Загрузка...</option>}
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-group">
            <label>
              Должность:
              <select
                name="position_id"
                value={formData.position_id}
                onChange={handleChange}
                required
                disabled={loading}
              >
                {loading && <option>Загрузка...</option>}
                {positions.map(pos => (
                  <option key={pos.id} value={pos.id}>
                    {pos.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-add">
            Сохранить
          </button>
          <button type="button" onClick={onCancel} className="btn-cancel">
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeesEditor;