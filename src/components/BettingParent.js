import React, { useState } from 'react';
import BettingGrid from './BettingGrid';
import BetTicket from './BetTicket';
import BettingModal from './BettingModal';
import TicketsModal from './TicketsModal';

const BettingParent = ({ matchupsCache, oddsCache }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTicketsModalOpen, setIsTicketsModalOpen] = useState(false);
  const [selectedBets, setSelectedBets] = useState([]);
  const [submittedTickets, setSubmittedTickets] = useState([]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openTicketsModal = () => setIsTicketsModalOpen(true);
  const closeTicketsModal = () => setIsTicketsModalOpen(false);

  const clearTicket = () => {
    setSelectedBets([]);
  };

  const finalizeTicket = (ticket) => {
    setSubmittedTickets((prevTickets) => [...prevTickets, ticket]);
    clearTicket();
  };

  return (
    <div>
      <div className="bet-ticket-buttons-container">
        <button className="bet-ticket-button" onClick={openModal}>
          Open Bet Ticket
        </button>
        <button className="show-bet-tickets-button" onClick={openTicketsModal}>
          Your Bet Tickets
        </button>
      </div>

      <BettingModal isOpen={isModalOpen} onClose={closeModal}>
        <div className="betting-grid-container">
          <BettingGrid
            matchupsCache={matchupsCache}
            oddsCache={oddsCache}
            selectedBets={selectedBets}
            setSelectedBets={setSelectedBets}
          />
        </div>
        <div className="bet-ticket-container">
          <BetTicket
            selectedBets={selectedBets}
            setSelectedBets={setSelectedBets}
            matchupsCache={matchupsCache}
            clearTicket={clearTicket}
            finalizeTicket={finalizeTicket}
          />
        </div>
      </BettingModal>

      <TicketsModal
        isOpen={isTicketsModalOpen}
        onClose={closeTicketsModal}
        submittedTickets={submittedTickets}
      />
    </div>
  );
};

export default BettingParent;
