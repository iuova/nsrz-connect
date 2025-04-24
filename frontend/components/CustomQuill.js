import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const CustomQuill = ({ value, onChange, placeholder, ...props }) => {
  const [isClient, setIsClient] = useState(false);
  const quillRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
    return () => setIsClient(false);
  }, []);

  // Конфигурация модулей Quill
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

  if (!isClient) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ 
          width: '100%',
          minHeight: '200px',
          padding: '10px',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}
      />
    );
  }

  const ReactQuill = require('react-quill').default;

  return (
    <ReactQuill
      ref={quillRef}
      value={value}
      onChange={onChange}
      modules={modules}
      formats={formats}
      placeholder={placeholder}
      theme="snow"
      style={{ minHeight: '200px' }}
      {...props}
    />
  );
};

export default CustomQuill;