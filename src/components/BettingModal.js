import React from 'react';
import './BettingModal.css';

const BettingModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="betting-modal-overlay">
      <div className="betting-modal">
        <button className="betting-modal-close-button" onClick={onClose}>
          X
        </button>
        <div className="betting-modal-content">{children}</div>
      </div>
    </div>
  );
};

export default BettingModal;
