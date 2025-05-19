import React, { useState, useEffect } from 'react';
import { createDepartment, updateDepartment, fetchDepartments } from '../api/departmentsApi';
import './DepartmentEditor.css';

const DepartmentEditor = ({ department, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: department?.id || '',
    name: department?.name || '',
    fullname: department?.fullname || '',
    code_zup: department?.code_zup || '',
    organization: department?.organization || '',
    parent_id: department?.parent_id || ''
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDepartments = async () => {
      setLoading(true);
      try {
        const data = await fetchDepartments();
        setDepartments(data);
        if (!department?.id && data.length > 0) {
          setFormData(prev => ({ ...prev, parent_id: data[0].id }));
        }
      } catch (error) {
        console.error('Ошибка загрузки подразделений:', error);
        setError('Ошибка загрузки подразделений');
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };
    loadDepartments();
  }, [department?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (department?.id) {
        await updateDepartment(department.id, formData);
      } else {
        await createDepartment(formData);
      }
      onSave();
    } catch (error) {
      console.error('Ошибка сохранения подразделения:', error);
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
        
        <h2>{department?.id ? 'Подразделение (редактирование)' : 'Подразделение (создание)'}</h2>
        
        <div className="id-label">
          <span>ID: {formData.id}</span>
        </div>

        <label>
          Название:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Полное название:
          <input
            type="text"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Код ЗУП:
          <input
            type="text"
            name="code_zup"
            value={formData.code_zup}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Организация:
          <input
            type="text"
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Родитель:
          <select
            name="parent_id"
            value={formData.parent_id}
            onChange={handleChange}
            disabled={loading}
            className="select-placeholder"
          >
            <option value="" disabled>Выберите родительское подразделение</option>
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

        <div className="form-actions">
          <button type="submit" className="btn-save">
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

export default DepartmentEditor; 