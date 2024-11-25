import React from 'react';
import ArchivedTicketManager from './ArchivedTicketManager';
import './TicketsModal.css';

const ArchivedTicketsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="tickets-modal-overlay">
      <div className="tickets-modal">
        <button className="tickets-modal-close-button" onClick={onClose}>
          X
        </button>
        <h2>Archived Tickets</h2>
        <div className="tickets-grid">
          <ArchivedTicketManager />
        </div>
      </div>
    </div>
  );
};

export default ArchivedTicketsModal;
