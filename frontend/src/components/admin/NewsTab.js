import React, { useState, useEffect } from 'react';
import { getNews, deleteNews, publishNews } from '../../api/newsApi';
import NewsEditor from '../NewsEditor';
import Pagination from '../common/Pagination';
import './Tabs.css';

const NewsTab = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingNews, setEditingNews] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const loadNews = async () => {
    try {
      const data = await getNews(true);
      setNews(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const handleDeleteNews = async () => {
    if (selectedItems.length === 0) {
      alert('Выберите новости для удаления');
      return;
    }
    
    if (window.confirm('Вы уверены, что хотите удалить выбранные новости?')) {
      try {
        // Удаляем все выбранные новости
        await Promise.all(selectedItems.map(id => deleteNews(id)));
        setNews(prev => prev.filter(item => !selectedItems.includes(item.id)));
        setSelectedItems([]);
        setSelectAll(false);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handlePublishNews = async (publish) => {
    if (selectedItems.length === 0) {
      alert('Выберите новости для изменения статуса публикации');
      return;
    }
    
    try {
      // Изменяем статус всех выбранных новостей
      await Promise.all(selectedItems.map(id => publishNews(id, publish)));
      
      // Обновляем локальное состояние с текущей датой
      const now = new Date().toISOString();
      setNews(prev => prev.map(item => 
        selectedItems.includes(item.id) 
          ? { 
              ...item, 
              published: publish,
              publish_date: publish ? now : null
            } 
          : item
      ));
      
      // Добавляем сброс выбранных элементов после действия
      setSelectedItems([]);
      setSelectAll(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentItems.map(item => item.id));
    }
    setSelectAll(!selectAll);
  };

  const handleRowDoubleClick = (item) => {
    setEditingNews(item);
  };

  // Функция для сортировки
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Форматирование даты для отображения
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Сортировка данных
  const sortedData = React.useMemo(() => {
    let sortableItems = [...news];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] === null) return sortConfig.direction === 'asc' ? 1 : -1;
        if (b[sortConfig.key] === null) return sortConfig.direction === 'asc' ? -1 : 1;
        
        if (sortConfig.key === 'publish_date') {
          // Сортировка дат
          const dateA = a.publish_date ? new Date(a.publish_date).getTime() : 0;
          const dateB = b.publish_date ? new Date(b.publish_date).getTime() : 0;
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        } else {
          // Сортировка строк
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
        }
        return 0;
      });
    }
    return sortableItems;
  }, [news, sortConfig]);

  // Получение иконки сортировки
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return '↕';
    }
    return sortConfig.direction === 'asc' ? '↓' : '↑';
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    // Сбрасываем выбор при смене страницы
    setSelectedItems([]);
    setSelectAll(false);
  }, [currentPage]);

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <>
      <div className="actions-toolbar">
        <button 
          onClick={() => setEditingNews({ title: '', content: '' })}
          className="btn-add"
        >
          + Добавить новость
        </button>
        
        {selectedItems.length > 0 && (
          <>
            <button
              onClick={() => handlePublishNews(true)}
              className="btn-action btn-publish"
            >
              Опубликовать выбранные
            </button>
            <button
              onClick={() => handlePublishNews(false)}
              className="btn-action btn-unpublish"
            >
              Снять с публикации
            </button>
            <button
              onClick={handleDeleteNews}
              className="btn-action btn-delete"
            >
              Удалить выбранные
            </button>
          </>
        )}
      </div>

      {editingNews && (
        <NewsEditor
          news={editingNews}
          onSave={() => {
            setEditingNews(null);
            loadNews();
            // Сбрасываем выбор после сохранения
            setSelectedItems([]);
            setSelectAll(false);
          }}
          onCancel={() => setEditingNews(null)}
        />
      )}

      <table className="news-table">
        <thead>
          <tr>
            <th>
              <input 
                type="checkbox" 
                checked={selectAll}
                onChange={handleSelectAll}
              />
            </th>
            <th onClick={() => requestSort('title')} className="sortable-column">
              Заголовок {getSortIcon('title')}
            </th>
            <th onClick={() => requestSort('published')} className="sortable-column">
              Статус {getSortIcon('published')}
            </th>
            <th onClick={() => requestSort('publish_date')} className="sortable-column">
              Дата {getSortIcon('publish_date')}
            </th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map(item => (
            <tr 
              key={item.id} 
              onDoubleClick={() => handleRowDoubleClick(item)}
              className={`news-row ${selectedItems.includes(item.id) ? 'selected' : ''}`}
            >
              <td>
                <input 
                  type="checkbox" 
                  checked={selectedItems.includes(item.id)}
                  onChange={() => handleSelectItem(item.id)}
                />
              </td>
              <td>{item.title}</td>
              <td>{item.published ? 'Опубликовано' : 'Не опубликовано'}</td>
              <td>{formatDate(item.publish_date)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        itemsCount={news.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </>
  );
};

export default NewsTab; 