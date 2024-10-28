import React from 'react';
import TicketManager from './TicketManager';
import './TicketsModal.css';

const TicketsModal = ({ isOpen, onClose, submittedTickets }) => {
  if (!isOpen) return null;

  return (
    <div className="tickets-modal-overlay">
      <div className="tickets-modal">
        <button className="tickets-modal-close-button" onClick={onClose}>
          X
        </button>
        <h2>Your Bet Tickets</h2>
        <div className="tickets-grid">
          <TicketManager submittedTickets={submittedTickets} />
        </div>
      </div>
    </div>
  );
};

export default TicketsModal;
