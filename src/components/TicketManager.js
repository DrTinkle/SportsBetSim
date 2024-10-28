import React from 'react';

const sortBets = (a, b) => {
  const sportOrder = ['B', 'S', 'H'];
  const aSport = a[0];
  const bSport = b[0];

  if (aSport !== bSport) {
    return sportOrder.indexOf(aSport) - sportOrder.indexOf(bSport);
  }

  return parseInt(a.slice(1)) - parseInt(b.slice(1));
};

const TicketManager = ({ submittedTickets }) => (
  <div className="ticket-manager">
    {submittedTickets.length === 0 ? (
      <div>No submitted tickets yet.</div>
    ) : (
      <div className="submitted-tickets-list">
        {submittedTickets.map((ticket, index) => {
          const sortedLabels = Object.keys(ticket.betLines).sort(sortBets);

          return (
            <div key={index} className="submitted-ticket-item">
              <p>
                <strong>Ticket {index + 1}</strong>
              </p>
              <p>
                Odds Range: {ticket.oddsRange.min} - {ticket.oddsRange.max}
              </p>
              <p>Bet Amount: {ticket.betAmount}</p>
              <p>Total Lines: {ticket.totalLines}</p>
              <p>Total Cost: {ticket.totalCost}</p>
              <p>
                Potential Winnings: {ticket.potentialWinnings.min} - {ticket.potentialWinnings.max}
              </p>

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
            </div>
          );
        })}
      </div>
    )}
  </div>
);

export default TicketManager;
