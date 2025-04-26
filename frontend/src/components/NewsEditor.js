import React, { useState } from 'react';
import { createNews, updateNews } from '../api/newsApi';
import './NewsEditor.css';

const NewsEditor = ({ news, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: news?.title || '',
    content: news?.content || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (news?.id) {
        await updateNews(news.id, formData);
      } else {
        await createNews(formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving news:', error);
    }
  };

  return (
    <div className="editor-modal">
      <form onSubmit={handleSubmit} className="editor-form">
        <h2>{news?.id ? 'Edit News' : 'Create News'}</h2>
        
        <label>
          Title:
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Content:
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
            Save
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            className="btn-cancel"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewsEditor; 