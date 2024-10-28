import React, { useState } from 'react';

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

const sortBets = (a, b) => {
  const sportOrder = ['B', 'S', 'H'];
  const aSport = a[0];
  const bSport = b[0];

  if (aSport !== bSport) {
    return sportOrder.indexOf(aSport) - sportOrder.indexOf(bSport);
  }

  return parseInt(a.slice(1)) - parseInt(b.slice(1));
};

const BetTicket = ({ selectedBets, setSelectedBets, finalizeTicket, clearTicket }) => {
  const [betAmount, setBetAmount] = useState(0);

  const groupedBets = selectedBets.reduce((acc, bet) => {
    if (!acc[bet.label]) {
      acc[bet.label] = [];
    }
    acc[bet.label].push(bet);
    return acc;
  }, {});

  const sortedLabels = Object.keys(groupedBets).sort(sortBets);

  const calculateBetRows = () => {
    if (selectedBets.length === 0) return { min: 0, max: 0, totalLines: 0 };

    const betGroups = Object.values(groupedBets);

    const combinations = generateCombinations(betGroups);

    const rowOdds = combinations.map((row) =>
      row.reduce((total, bet) => total * parseFloat(bet.odds), 1)
    );

    const minOdds = Math.min(...rowOdds).toFixed(2);
    const maxOdds = Math.max(...rowOdds).toFixed(2);

    return { min: minOdds, max: maxOdds, totalLines: combinations.length };
  };

  const { min, max, totalLines } = calculateBetRows();

  const handleBetAmountChange = (e) => {
    const amount = parseFloat(e.target.value);
    setBetAmount(isNaN(amount) ? 0 : amount);
  };

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

    finalizeTicket(ticket);

    clearTicket();
  };

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
          <div className="bet-amount-input">
            <label>Bet Amount per Line: </label>
            <input
              type="number"
              value={betAmount}
              onChange={handleBetAmountChange}
              placeholder="Enter amount"
            />
          </div>

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

          <button className="finalize-ticket-button" onClick={handleFinalizeTicket}>
            Finalize Ticket
          </button>

          <button className="clear-ticket-button" onClick={handleClearTicket}>
            Clear Ticket
          </button>
        </>
      )}
    </div>
  );
};

export default BetTicket;
