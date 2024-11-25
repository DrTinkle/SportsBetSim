import React from 'react';
import './ErrorModal.css';

const ErrorModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="error-modal-overlay">
      <div className="error-modal">
        <h2>Error</h2>
        <p>{message}</p>
        <button className="error-modal-close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ErrorModal;
