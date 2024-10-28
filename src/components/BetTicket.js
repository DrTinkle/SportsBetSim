import React, { useState } from 'react';

// Helper function to generate all combinations (bet rows)
const generateCombinations = (betGroups) => {
  const result = [];

  const recurse = (currentRow, index) => {
    if (index === betGroups.length) {
      result.push(currentRow);
      return;
    }

    for (const bet of betGroups[index]) {
      recurse([...currentRow, bet], index + 1);
    }
  };

  recurse([], 0);

  return result;
};

// Function to sort bets by sport order: B, S, H (Boxing, Soccer, Hockey)
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

const BetTicket = ({ selectedBets, setSelectedBets, finalizeTicket, clearTicket }) => {
  const [betAmount, setBetAmount] = useState(0); // Bet amount state

  // Group bets by match label (e.g., B1, S1)
  const groupedBets = selectedBets.reduce((acc, bet) => {
    if (!acc[bet.label]) {
      acc[bet.label] = [];
    }
    acc[bet.label].push(bet);
    return acc;
  }, {});

  // Sort the grouped bets by B, S, H order
  const sortedLabels = Object.keys(groupedBets).sort(sortBets);

  // Calculate all combinations of bet rows and their total odds
  const calculateBetRows = () => {
    if (selectedBets.length === 0) return { min: 0, max: 0, totalLines: 0 };

    // Get all bet groups for combinations
    const betGroups = Object.values(groupedBets);

    // Generate all possible combinations of bets
    const combinations = generateCombinations(betGroups);

    // Calculate odds for each row and find the min/max odds
    const rowOdds = combinations.map((row) =>
      row.reduce((total, bet) => total * parseFloat(bet.odds), 1)
    );

    const minOdds = Math.min(...rowOdds).toFixed(2);
    const maxOdds = Math.max(...rowOdds).toFixed(2);

    return { min: minOdds, max: maxOdds, totalLines: combinations.length };
  };

  const { min, max, totalLines } = calculateBetRows();

  // Function to handle bet amount input
  const handleBetAmountChange = (e) => {
    const amount = parseFloat(e.target.value);
    setBetAmount(isNaN(amount) ? 0 : amount);
  };

  // Function to finalize and save the ticket
  const handleFinalizeTicket = () => {
    const totalCost = betAmount * totalLines;

    const ticket = {
      betLines: groupedBets,
      betAmount,
      totalLines,
      totalCost,
      oddsRange: { min, max },
      potentialWinnings: {
        min: (betAmount * min).toFixed(2),
        max: (betAmount * max).toFixed(2),
      },
    };

    // Send the ticket to the parent component (TicketManager) for saving
    finalizeTicket(ticket);

    // Clear the bet ticket
    clearTicket();
  };

  // Function to manually clear the ticket
  const handleClearTicket = () => {
    clearTicket();
    setBetAmount(0);
  };

  return (
    <div className="bet-ticket">
      <h2>Bet Ticket</h2>

      {selectedBets.length === 0 ? (
        <div>No bets selected yet.</div>
      ) : (
        <ul className="bet-ticket-list">
          {sortedLabels.map((label, index) => (
            <li key={index} className="bet-ticket-item">
              <div>
                <strong>{label}</strong> -{' '}
                {groupedBets[label].map((bet) => `${bet.outcome} (${bet.odds})`).join(', ')}
              </div>
            </li>
          ))}
        </ul>
      )}

      {selectedBets.length > 0 && (
        <>
          {/* Bet amount input */}
          <div className="bet-amount-input">
            <label>Bet Amount per Line: </label>
            <input
              type="number"
              value={betAmount}
              onChange={handleBetAmountChange}
              placeholder="Enter amount"
            />
          </div>

          {/* Display the odds range for the bet rows */}
          <div className="bet-ticket-footer">
            <p>
              Odds: {min} - {max}
            </p>
            <p>Total Bet Lines: {totalLines}</p>
            <p>Total Cost: {betAmount > 0 ? (betAmount * totalLines).toFixed(2) : '0'}</p>
            <p>
              Potential Winnings: {betAmount > 0 ? (betAmount * min).toFixed(2) : '0'} -{' '}
              {betAmount > 0 ? (betAmount * max).toFixed(2) : '0'}
            </p>
          </div>

          {/* Finalize ticket button */}
          <button className="finalize-ticket-button" onClick={handleFinalizeTicket}>
            Finalize Ticket
          </button>

          {/* Clear ticket button */}
          <button className="clear-ticket-button" onClick={handleClearTicket}>
            Clear Ticket
          </button>
        </>
      )}
    </div>
  );
};

export default BetTicket;
