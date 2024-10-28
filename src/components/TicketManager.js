import React from 'react';

// Helper function to sort bets by sport order: B, S, H (Boxing, Soccer, Hockey)
const sortBets = (a, b) => {
  const sportOrder = ['B', 'S', 'H'];
  const aSport = a[0]; // First letter (e.g., B1 => B)
  const bSport = b[0];

  if (aSport !== bSport) {
    return sportOrder.indexOf(aSport) - sportOrder.indexOf(bSport); // Sort by sport order
  }

  // If same sport, sort by match number (e.g., B1 vs B2)
  return parseInt(a.slice(1)) - parseInt(b.slice(1));
};

const TicketManager = ({ submittedTickets }) => (
  <div className="ticket-manager">
    {submittedTickets.length === 0 ? (
      <div>No submitted tickets yet.</div>
    ) : (
      <div className="submitted-tickets-list">
        {submittedTickets.map((ticket, index) => {
          // Sort the bet lines in the same way as in BetTicket
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

              {/* Display the bet lines similar to BetTicket */}
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
