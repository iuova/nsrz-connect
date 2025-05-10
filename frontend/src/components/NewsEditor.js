import React, { useState } from 'react';
import { createNews, updateNews } from '../api/newsApi';
import './NewsEditor.css';

const NewsEditor = ({ news, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: news?.title || '',
    content: news?.content || ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    console.log('Отправляем данные новости:', formData);
    
    try {
      if (news?.id) {
        console.log('Обновляем существующую новость с ID:', news.id);
        await updateNews(news.id, formData);
      } else {
        console.log('Создаем новую новость');
        const response = await createNews(formData);
        console.log('Ответ сервера:', response);
      }
      console.log('Новость успешно сохранена');
      onSave();
    } catch (error) {
      console.error('Error saving news:', error);
      console.error('Детали ошибки:', error.response?.data || error.message);
      setError(error.response?.data?.error || error.message || 'Ошибка сохранения новости');
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
        
        <h2>{news?.id ? 'Новость (редактирование)' : 'Новость (создание)'}</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <label>
          Заголовок:
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Содержание:
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows={10}
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

export default NewsEditor; 