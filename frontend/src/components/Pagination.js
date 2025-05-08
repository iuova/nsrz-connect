import React from 'react';
import '../pages/AdminPanel.css';

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const pageNumbers = Array.from({ length: Math.ceil(totalItems / itemsPerPage) }, (_, i) => i + 1);

  return (
    <div className="pagination">
      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          disabled={number === currentPage}
        >
          {number}
        </button>
      ))}
    </div>
  );
};

export default Pagination; 