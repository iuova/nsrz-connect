import React from 'react';

const Pagination = ({ itemsCount, itemsPerPage, currentPage, onPageChange }) => {
  const pageCount = Math.ceil(itemsCount / itemsPerPage);
  
  if (pageCount <= 1) return null;
  
  return (
    <div className="pagination">
      {Array.from({ length: pageCount }, (_, i) => (
        <button
          key={i + 1}
          onClick={() => onPageChange(i + 1)}
          className={currentPage === i + 1 ? 'active' : ''}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
};

export default Pagination; 