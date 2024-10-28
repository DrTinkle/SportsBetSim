import React, { useState, useEffect } from 'react';

const sports = ['boxing', 'soccer', 'hockey'];

const MatchHistory = ({ refreshKey }) => {
  const [history, setHistory] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchProcessedMatches = async () => {
    try {
      const response = await fetch('/api/recentProcessedMatches');
      const data = await response.json();
      setHistory(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching processed matches:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcessedMatches();
  }, [refreshKey]);

  if (loading) {
    return <div>Loading processed matches...</div>;
  }

  return (
    <div className="match-history-container">
      <h2 className="match-history-header">Match History</h2>
      <div className="match-history-grid">
        {sports.map((sport, index) => (
          <div key={index} className="match-history-sport-section">
            <h3>{sport.charAt(0).toUpperCase() + sport.slice(1)}</h3>
            <ul className="match-history-list">
              {history[sport] && history[sport].length > 0 ? (
                history[sport]
                  .slice(-10)
                  .reverse()
                  .map((match, matchIndex) => (
                    <li key={matchIndex} className="match-history-item">
                      <div>
                        {match.winner === match.teamA ? (
                          <strong>
                            {match.teamA} {match.scoreTeamA}
                          </strong>
                        ) : (
                          <span>
                            {match.teamA} {match.scoreTeamA}
                          </span>
                        )}{' '}
                        -{' '}
                        {match.winner === match.teamB ? (
                          <strong>
                            {match.scoreTeamB} {match.teamB}
                          </strong>
                        ) : (
                          <span>
                            {match.scoreTeamB} {match.teamB}
                          </span>
                        )}
                      </div>
                      <div className="match-odds">
                        {' '}
                        {match.winner === match.teamA ? (
                          <strong>{match.oddsTeamA}</strong>
                        ) : (
                          <span>{match.oddsTeamA}</span>
                        )}{' '}
                        | Draw:{' '}
                        {match.winner === 'draw' ? (
                          <strong>{match.oddsDraw}</strong>
                        ) : (
                          <span>{match.oddsDraw}</span>
                        )}{' '}
                        |{' '}
                        {match.winner === match.teamB ? (
                          <strong>{match.oddsTeamB}</strong>
                        ) : (
                          <span>{match.oddsTeamB}</span>
                        )}
                      </div>
                    </li>
                  ))
              ) : (
                <li>No recently processed matches</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchHistory;
