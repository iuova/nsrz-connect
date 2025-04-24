import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import 'react-quill/dist/quill.snow.css';

// Ленивая загрузка ReactQuill только на клиенте
const loadReactQuill = () => {
  if (typeof window !== 'undefined') {
    return import('react-quill');
  }
  return Promise.resolve({ default: () => null });
};

const CustomQuill = ({ 
  value, 
  onChange, 
  placeholder, 
  styles = {}, 
  maxLength,
  onValidationError,
  onImageUpload,
  uploadEndpoint,
  ...props 
}) => {
  const [isClient, setIsClient] = useState(false);
  const [quillLoaded, setQuillLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const quillRef = useRef(null);
  const fileInputRef = useRef(null);

  // Загрузка Quill только при необходимости
  useEffect(() => {
    setIsClient(true);
    loadReactQuill()
      .then(() => setQuillLoaded(true))
      .catch(err => {
        console.error('Failed to load Quill:', err);
        setError('Не удалось загрузить редактор');
      });
  }, []);

  // Обработчик вставки изображения
  const insertImage = useCallback((url) => {
    if (!quillRef.current) return;
    
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection();
    editor.insertEmbed(range?.index || 0, 'image', url);
  }, []);

  // Обработчик загрузки изображения
  const handleImageUpload = useCallback(async (file) => {
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      let imageUrl;
      
      if (onImageUpload) {
        // Кастомная загрузка через переданный колбэк
        imageUrl = await onImageUpload(file);
      } else if (uploadEndpoint) {
        // Стандартная загрузка через API
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch(uploadEndpoint, {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) throw new Error('Ошибка загрузки');
        
        const data = await response.json();
        imageUrl = data.url || data.location;
      } else {
        throw new Error('Не настроена загрузка изображений');
      }
      
      insertImage(imageUrl);
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Ошибка загрузки изображения');
    } finally {
      setIsUploading(false);
    }
  }, [onImageUpload, uploadEndpoint, insertImage]);

  // Обработчик клика по кнопке изображения в тулбаре
  const imageHandler = useCallback(() => {
    if (!fileInputRef.current) return;
    fileInputRef.current.click();
  }, []);

  // Валидация содержимого
  const handleChange = useCallback((content) => {
    if (maxLength && content.length > maxLength) {
      const errorMsg = `Превышен лимит в ${maxLength} символов`;
      setError(errorMsg);
      onValidationError?.(errorMsg);
      return;
    }
    
    setError(null);
    onValidationError?.(null);
    onChange(content);
  }, [onChange, maxLength, onValidationError]);

  // Конфигурация модулей с обработчиком изображений
  const modules = React.useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
    clipboard: {
      matchVisual: false,
    }
  }), [imageHandler]);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'align',
    'link', 'image'
  ];

  // Fallback для SSR
  if (!isClient || error) {
    return (
      <div style={{ position: 'relative', ...styles.container }}>
        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          style={{ 
            width: '100%',
            minHeight: '200px',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            ...styles.editor
          }}
        />
        {error && (
          <div style={{ 
            color: '#d32f2f', 
            fontSize: '0.8rem',
            marginTop: '5px',
            ...styles.error 
          }}>
            {error}
          </div>
        )}
        {maxLength && (
          <div style={{
            textAlign: 'right',
            fontSize: '0.8rem',
            color: value?.length > maxLength ? '#d32f2f' : '#666',
            ...styles.counter
          }}>
            {value?.length || 0}/{maxLength}
          </div>
        )}
      </div>
    );
  }

  // Загрузочное состояние
  if (!quillLoaded) {
    return (
      <div style={{ 
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px dashed #ddd',
        ...styles.loading
      }}>
        Загрузка редактора...
      </div>
    );
  }

  const ReactQuill = require('react-quill').default;

  return (
    <div style={{ position: 'relative', ...styles.container }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleImageUpload(e.target.files?.[0])}
        accept="image/*"
        style={{ display: 'none' }}
      />
      
      {isUploading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255,255,255,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          ...styles.uploadOverlay
        }}>
          Загрузка изображения...
        </div>
      )}

      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        theme="snow"
        style={{ 
          minHeight: '200px',
          ...styles.editor 
        }}
        {...props}
      />
      {error && (
        <div style={{ 
          color: '#d32f2f', 
          fontSize: '0.8rem',
          marginTop: '5px',
          ...styles.error 
        }}>
          {error}
        </div>
      )}
      {maxLength && (
        <div style={{
          textAlign: 'right',
          fontSize: '0.8rem',
          color: value?.length > maxLength ? '#d32f2f' : '#666',
          ...styles.counter
        }}>
          {value?.length || 0}/{maxLength}
        </div>
      )}
    </div>
  );
};

CustomQuill.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  styles: PropTypes.shape({
    container: PropTypes.object,
    editor: PropTypes.object,
    error: PropTypes.object,
    counter: PropTypes.object,
    loading: PropTypes.object,
    uploadOverlay: PropTypes.object
  }),
  maxLength: PropTypes.number,
  onValidationError: PropTypes.func,
  onImageUpload: PropTypes.func,
  uploadEndpoint: PropTypes.string
};

CustomQuill.defaultProps = {
  value: '',
  placeholder: '',
  styles: {}
};

export default React.memo(CustomQuill); 