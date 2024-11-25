import React, { useState } from 'react';
import BettingGrid from './BettingGrid';
import BetTicket from './BetTicket';
import BettingModal from './BettingModal';
import TicketsModal from './TicketsModal';
import ArchivedTicketsModal from './ArchivedTicketsModal';

const BettingParent = ({ matchupsCache, oddsCache, updateBankData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTicketsModalOpen, setIsTicketsModalOpen] = useState(false);
  const [selectedBets, setSelectedBets] = useState([]);
  const [submittedTickets, setSubmittedTickets] = useState([]);
  const [refreshBalanceTrigger, setRefreshBalanceTrigger] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

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
    setRefreshBalanceTrigger((prev) => !prev);
  };

  return (
    <div>
      <div className="bet-ticket-buttons-container">
        <button className="bet-ticket-button" onClick={openModal}>
          Open Bet Ticket
        </button>
        <button className="show-bet-tickets-button" onClick={openTicketsModal}>
          View Your Bet Tickets
        </button>
      </div>
      <div className="tickets-archive-button-container">
        <button className="archived-tickets-button" onClick={() => setIsArchiveModalOpen(true)}>
          View Archived Tickets
        </button>
      </div>
      <BettingModal
        isOpen={isModalOpen}
        onClose={closeModal}
        refreshBalanceTrigger={refreshBalanceTrigger}
      >
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
            updateBankData={updateBankData}
          />
        </div>
      </BettingModal>
      <TicketsModal
        isOpen={isTicketsModalOpen}
        onClose={closeTicketsModal}
        submittedTickets={submittedTickets}
      />
      <ArchivedTicketsModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
      />
      ;
    </div>
  );
};

export default BettingParent;
