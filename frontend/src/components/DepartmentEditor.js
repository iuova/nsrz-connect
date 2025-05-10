import React, { useState } from 'react';
import { createDepartment, updateDepartment } from '../api/departmentsApi';
import './DepartmentEditor.css';

const DepartmentEditor = ({ department, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: department?.name || '',
    fullname: department?.fullname || '',
    code_zup: department?.code_zup || '',
    organization: department?.organization || ''
  });

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
      console.error('Error saving department:', error);
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