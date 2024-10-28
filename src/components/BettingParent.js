import React, { useState } from 'react';
import BettingGrid from './BettingGrid';
import BetTicket from './BetTicket';
import BettingModal from './BettingModal';
import TicketsModal from './TicketsModal';

const BettingParent = ({ matchupsCache, oddsCache }) => {
  const [isModalOpen, setIsModalOpen] = useState(false); // Bet ticket modal
  const [isTicketsModalOpen, setIsTicketsModalOpen] = useState(false); // Tickets modal
  const [selectedBets, setSelectedBets] = useState([]);
  const [submittedTickets, setSubmittedTickets] = useState([]); // Holds all submitted tickets

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openTicketsModal = () => setIsTicketsModalOpen(true);
  const closeTicketsModal = () => setIsTicketsModalOpen(false);

  // Function to clear the bet ticket
  const clearTicket = () => {
    setSelectedBets([]); // Clear all selected bets
  };

  // Function to finalize and save the bet ticket
  const finalizeTicket = (ticket) => {
    setSubmittedTickets((prevTickets) => [...prevTickets, ticket]); // Add ticket to the list
    clearTicket(); // Clear the ticket after finalizing
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

      {/* Betting Ticket Modal */}
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

      {/* Tickets Manager Modal */}
      <TicketsModal
        isOpen={isTicketsModalOpen}
        onClose={closeTicketsModal}
        submittedTickets={submittedTickets} // Pass submitted tickets here
      />
    </div>
  );
};

export default BettingParent;
