import React, { useEffect, useState } from 'react';
import './TicketsModal.css';

const sortBets = (a, b) => {
  const sportOrder = ['B', 'S', 'H'];
  const aSport = a[0];
  const bSport = b[0];

  if (aSport !== bSport) {
    return sportOrder.indexOf(aSport) - sportOrder.indexOf(bSport);
  }

  return parseInt(a.slice(1)) - parseInt(b.slice(1));
};

const TicketManager = () => {
  const [submittedTickets, setSubmittedTickets] = useState([]);
  const [flippedTickets, setFlippedTickets] = useState({});

  useEffect(() => {
    fetch('/api/getTickets', {
      method: 'GET',
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => setSubmittedTickets(data))
      .catch((error) => console.error('Error fetching tickets:', error));
  }, []);

  const toggleFlip = (index) => {
    setFlippedTickets((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const getTicketStatus = (ticket) => {
    if (!ticket.ticketProcessed) return 'Pending';
    return ticket.totalWinnings > 0 ? 'Win' : 'Lose';
  };

  const handleTrashTicket = (ticketId) => {
    fetch(`/api/tickets/${ticketId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then(() => {
        setSubmittedTickets((prev) => prev.filter((ticket) => ticket.ticketId !== ticketId));
      })
      .catch((error) => console.error('Error deleting ticket:', error));
  };

  const handleArchiveTicket = (ticketId) => {
    fetch(`/api/tickets/${ticketId}/archive`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(() => {
        setSubmittedTickets((prev) => prev.filter((ticket) => ticket.ticketId !== ticketId));
      })
      .catch((error) => console.error('Error archiving ticket:', error));
  };

  return (
    <div className="ticket-manager">
      {submittedTickets.length === 0 ? (
        <div>No submitted tickets yet.</div>
      ) : (
        <div className="submitted-tickets-container">
          <p className="click-tickets-text">Click ticket to view ticket matchups.</p>
          <div className="submitted-tickets-list">
            {submittedTickets.map((ticket, index) => {
              const sortedLabels = Object.keys(ticket.betLines).sort(sortBets);
              const ticketStatus = getTicketStatus(ticket);

              return (
                <div
                  key={index}
                  className={`submitted-ticket-item ${flippedTickets[index] ? 'flipped' : ''}`}
                  onClick={() => toggleFlip(index)}
                >
                  {ticket.ticketProcessed && (
                    <div className={`ticket-overlay ${ticketStatus.toLowerCase()}`}>
                      <strong className="ticket-overlay-text">{ticketStatus}</strong>
                    </div>
                  )}
                  {flippedTickets[index] ? (
                    <ul className="bet-ticket-list">
                      {sortedLabels.map((label, labelIndex) => {
                        const uniqueMatchups = Array.from(
                          new Map(
                            ticket.betLines[label].map((bet) => [
                              bet.matchId,
                              `${bet.teamA} vs ${bet.teamB}`,
                            ])
                          ).values()
                        );

                        return (
                          <li key={labelIndex} className="bet-ticket-item">
                            <div>
                              <strong>{label}</strong> - {uniqueMatchups.join(', ')}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <>
                      <p>
                        <strong>Ticket {index + 1}</strong>
                      </p>
                      <p>
                        <strong>Status:</strong> {ticketStatus}
                      </p>
                      {ticket.ticketProcessed && (
                        <p>
                          <strong>Winnings:</strong> {ticket.totalWinnings}
                        </p>
                      )}

                      <ul className="bet-ticket-list">
                        {sortedLabels.map((label, labelIndex) => (
                          <li key={labelIndex} className="bet-ticket-item">
                            <div>
                              <strong>{label}</strong> -{' '}
                              {ticket.betLines[label]
                                .map((bet) => `${bet.outcome} (${bet.odds})`)
                                .join(', ')}
                            </div>
                          </li>
                        ))}
                      </ul>

                      <div className="ticket-details-text">
                        <p>
                          Odds Range: {ticket.oddsRange.min} - {ticket.oddsRange.max}
                        </p>
                        <p>Bet Amount: {ticket.betAmount}</p>
                        <p>Total Lines: {ticket.totalLines}</p>
                        <p>Total Cost: {ticket.totalCost}</p>
                        <br />
                        <strong>Potential Winnings (min - max):</strong>
                        <p>
                          {ticket.potentialWinnings.min} - {ticket.potentialWinnings.max}
                        </p>
                      </div>

                      {ticket.ticketProcessed && (
                        <div className="ticket-actions">
                          <button
                            className="archive-ticket-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchiveTicket(ticket.ticketId);
                            }}
                          >
                            Archive
                          </button>
                          <button
                            className="trash-ticket-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTrashTicket(ticket.ticketId);
                            }}
                          >
                            Trash
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketManager;
