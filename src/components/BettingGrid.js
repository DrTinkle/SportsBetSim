import React from 'react';

const sports = ['boxing', 'soccer', 'hockey'];

const BettingGrid = ({ matchupsCache, oddsCache, selectedBets, setSelectedBets }) => {
  const handleBetSelection = (sport, match, outcome, odds, matchNumber, matchId) => {
    const newBet = {
      label: `${sport.charAt(0).toUpperCase()}${matchNumber}`,
      outcome,
      odds,
      matchId,
    };

    const existingBetIndex = selectedBets.findIndex(
      (bet) => bet.label === newBet.label && bet.outcome === outcome
    );

    if (existingBetIndex > -1) {
      setSelectedBets(selectedBets.filter((_, index) => index !== existingBetIndex));
    } else {
      setSelectedBets([...selectedBets, newBet]);
    }
  };

  const getOddsForMatch = (teamA, teamB, sport) => {
    const cacheKey = `${teamA}-${teamB}-${sport}`;
    return oddsCache[cacheKey] || null;
  };

  return (
    <div className="betting-grid">
      <h2>Select Your Bets</h2>
      {sports.map((sport) => (
        <div key={sport} className="sport-section">
          <h3>{sport.charAt(0).toUpperCase() + sport.slice(1)}</h3>
          <table className="match-grid">
            <thead>
              <tr>
                <th>Teams</th>
                <th>1</th>
                <th>X</th>
                <th>2</th>
              </tr>
            </thead>
            <tbody>
              {matchupsCache[sport]?.length > 0 ? (
                matchupsCache[sport].map((match, index) => {
                  const odds = getOddsForMatch(match.teamA, match.teamB, sport);
                  const matchLabel = `${sport.charAt(0).toUpperCase()}${index + 1}`;
                  const matchId = match.matchId;

                  return (
                    <tr key={index}>
                      <td>
                        {matchLabel} - {match.teamA} vs {match.teamB}
                      </td>
                      <td>
                        <button
                          onClick={() =>
                            handleBetSelection(
                              sport,
                              match,
                              '1',
                              odds?.oddsTeamA,
                              index + 1,
                              matchId
                            )
                          }
                          className={
                            selectedBets.some(
                              (bet) => bet.label === matchLabel && bet.outcome === '1'
                            )
                              ? 'selected-bet'
                              : ''
                          }
                        >
                          {odds ? odds.oddsTeamA : 'Loading...'}
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() =>
                            handleBetSelection(
                              sport,
                              match,
                              'X',
                              odds?.oddsDraw,
                              index + 1,
                              matchId
                            )
                          }
                          className={
                            selectedBets.some(
                              (bet) => bet.label === matchLabel && bet.outcome === 'X'
                            )
                              ? 'selected-bet'
                              : ''
                          }
                        >
                          {odds ? odds.oddsDraw : 'Loading...'}
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() =>
                            handleBetSelection(
                              sport,
                              match,
                              '2',
                              odds?.oddsTeamB,
                              index + 1,
                              matchId
                            )
                          }
                          className={
                            selectedBets.some(
                              (bet) => bet.label === matchLabel && bet.outcome === '2'
                            )
                              ? 'selected-bet'
                              : ''
                          }
                        >
                          {odds ? odds.oddsTeamB : 'Loading...'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4">No upcoming matches available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default BettingGrid;
