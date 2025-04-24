import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';

const NewsEditor = ({ initialData = {}, onSave, onCancel }) => {
  const [title, setTitle] = useState(initialData.title || '');
  const [content, setContent] = useState(initialData.content || '');
  const [image, setImage] = useState(initialData.image || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [contentError, setContentError] = useState(null);
  const [error, setError] = useState(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      editor.on('editor-change', handleContentChange);
      return () => editor.off('editor-change', handleContentChange);
    }
  }, []);

  const handleContentChange = (value, delta, source, editor) => {
    try {
      setContent(editor.getHTML());
    } catch (error) {
      console.error('Editor error:', error);
      setContent(value || '');
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'align',
    'link', 'image'
  ];

  // Обработчик загрузки изображения
  const handleImageUpload = async (file) => {
    // Проверка типа и размера
    if (!file.type.match('image.*')) {
      setError('Можно загружать только изображения');
      return;
    }
    
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      setError('Изображение должно быть меньше 5MB');
      return;
    }
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/custom-upload', formData);
      setImage(response.data.url);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handlePaste = (e) => {
    if (e.clipboardData.files && e.clipboardData.files.length) {
      e.preventDefault();
      handleImageUpload(e.clipboardData.files[0]);
    }
  };

  useEffect(() => {
    console.log('Current content:', content);
  }, [content]);

  return (
    <div className="news-editor">
      <h2>{initialData.id ? 'Редактирование' : 'Создание'} новости</h2>
      
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Заголовок новости"
      />
      
      <ReactQuill
        ref={quillRef}
        value={content}
        onChange={handleContentChange}
        modules={modules}
        formats={formats}
        placeholder="Текст новости..."
        theme="snow"
        bounds=".news-editor"
        style={{ minHeight: '300px' }}
      />

      <div className="form-group">
        <label htmlFor="image-upload">Загрузить изображение</label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files && e.target.files.length) {
              handleImageUpload(e.target.files[0]);
            }
          }}
          accept="image/*"
          id="image-upload"
          style={{ display: 'none' }}
        />
      </div>

      <div className="editor-actions">
        <button onClick={() => onSave({ title, content, image })}>
          Сохранить
        </button>
        <button onClick={onCancel}>
          Отмена
        </button>
      </div>
    </div>
  );
};

export default NewsEditor; 