import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NewsEditor.css';

// Импорт компонентов для форматирования текста
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

const NewsEditor = ({ newsId, onClose, onNewsCreated }) => {
  // Состояние для редактора текста
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  
  // Состояние формы
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: null,
    preview: null
  });
  
  // Состояние ошибок
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Режим предпросмотра
  const [isPreview, setIsPreview] = useState(false);
  
  // Обработка изображения
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Загрузка данных новости при редактировании
  useEffect(() => {
    const loadNewsData = async () => {
      if (newsId) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/news/${newsId}`);
          const { title, content, image } = response.data;
          
          setFormData({
            title: title || '',
            content: content || '',
            image: image || null
          });
          
          if (image) {
            setImagePreview(`${process.env.REACT_APP_API_URL}/uploads/${image}`);
          }
          
          // Инициализация редактора с существующим контентом
          if (content) {
            const contentBlock = htmlToDraft(content);
            if (contentBlock) {
              const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
              setEditorState(EditorState.createWithContent(contentState));
            }
          }
        } catch (err) {
          console.error('Error loading news data:', err);
          setError('Не удалось загрузить данные новости');
        }
      }
    };
    
    loadNewsData();
  }, [newsId]);

  // Обновление состояния формы при изменении редактора
  useEffect(() => {
    const html = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    setFormData(prev => ({
      ...prev,
      content: html
    }));
  }, [editorState]);

  // Обработчик изменения текстовых полей
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Обработчик изменения редактора
  const handleEditorChange = (state) => {
    setEditorState(state);
  };

  // Обработчик загрузки изображения
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Предпросмотр изображения
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Удаление изображения
  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({
      ...prev,
      image: null
    }));
  };

  // Функция для загрузки изображения на сервер
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/news/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data.filename;
    } catch (err) {
      console.error('Error uploading image:', err);
      throw new Error('Не удалось загрузить изображение');
    }
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      // Проверка на заполнение обязательных полей
      if (!formData.title || !formData.content) {
        throw new Error('Заголовок и содержимое обязательны для заполнения');
      }
      
      let imageFilename = formData.image;
      
      // Загрузка изображения на сервер, если оно есть
      if (imageFile) {
        imageFilename = await uploadImage(imageFile);
      }
      
      const newsData = {
        title: formData.title,
        content: formData.content,
        image: imageFilename
      };
      
      let response;
      
      if (newsId) {
        // Обновление существующей новости
        response = await axios.put(`${process.env.REACT_APP_API_URL}/news/${newsId}`, newsData);
      } else {
        // Создание новой новости
        response = await axios.post(`${process.env.REACT_APP_API_URL}/news`, newsData);
      }
      
      // Вызов колбэка для обновления списка новостей
      if (onNewsCreated) {
        onNewsCreated(response.data);
      }
      
      // Закрытие модального окна
      onClose();
    } catch (err) {
      setError(err.message || 'Произошла ошибка при сохранении новости');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Настройка панели инструментов редактора
  const toolbarConfig = {
    options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'colorPicker', 'link', 'embedded', 'emoji', 'image', 'remove', 'history'],
    inline: {
      options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace'],
    },
    blockType: {
      options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote'],
    },
    fontSize: {
      options: [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96],
    },
    list: {
      options: ['unordered', 'ordered'],
    },
  };

  // Компонент предпросмотра новости
  const NewsPreview = () => (
    <div className="news-preview">
      <h2>{formData.title || 'Без заголовка'}</h2>
      
      {imagePreview && (
        <div className="news-image">
          <img src={imagePreview} alt={formData.title} />
        </div>
      )}
      
      <div 
        className="news-content-preview"
        dangerouslySetInnerHTML={{ __html: formData.content }}
      />
      
      <div className="news-meta">
        <span>Дата: {new Date().toLocaleDateString('ru-RU')}</span>
      </div>
    </div>
  );

  return (
    <div className="editor-modal">
      <div className="editor-form">
        <button className="close-button" onClick={onClose} aria-label="Закрыть"></button>
        <h2>{newsId ? 'Редактирование новости' : 'Создание новости'}</h2>
        
        {/* Tabs для переключения между редактированием и предпросмотром */}
        <div className="editor-tabs">
          <button 
            className={`tab-button ${!isPreview ? 'active' : ''}`} 
            onClick={() => setIsPreview(false)}
          >
            Редактирование
          </button>
          <button 
            className={`tab-button ${isPreview ? 'active' : ''}`} 
            onClick={() => setIsPreview(true)}
          >
            Предпросмотр
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        {isPreview ? (
          <NewsPreview />
        ) : (
          <form onSubmit={handleSubmit}>
            <label>
              Заголовок:
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Введите заголовок новости"
              />
            </label>
            
            {/* Загрузка изображения */}
            <div className="image-upload-label">
              Изображение:
              <input
                type="file"
                id="image-upload"
                className="image-upload-input"
                accept="image/*"
                onChange={handleImageChange}
              />
              <label htmlFor="image-upload" className="image-upload-btn">
                {imagePreview ? 'Изменить изображение' : 'Загрузить изображение'}
              </label>
              
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Предпросмотр" />
                  <button 
                    type="button" 
                    className="remove-image-btn"
                    onClick={removeImage}
                  >
                    Удалить изображение
                  </button>
                </div>
              )}
            </div>
            
            {/* Редактор текста с форматированием */}
            <div className="content-editor-label">
              Содержимое:
              <div className="content-editor">
                <Editor
                  editorState={editorState}
                  onEditorStateChange={handleEditorChange}
                  toolbar={toolbarConfig}
                  placeholder="Введите содержимое новости..."
                  localization={{
                    locale: 'ru',
                  }}
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Отмена
              </button>
              <button 
                type="submit" 
                className="btn-save"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default NewsEditor; 