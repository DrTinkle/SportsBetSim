import React, { useEffect, useState } from 'react';

const sports = ['boxing', 'soccer', 'hockey'];

const NextMatchups = ({ matchupsCache, oddsCache, refreshKey }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (Object.keys(matchupsCache).length > 0) {
      setLoading(false);
    }
  }, [matchupsCache, refreshKey]);

  const getOddsForMatch = (teamA, teamB, sport) => {
    const cacheKey = `${teamA}-${teamB}-${sport}`;
    return oddsCache[cacheKey] || null;
  };

  if (loading) {
    return <div className="initial-setup-text">Processing initial setup...</div>;
  }

  return (
    <div className="matchups-container">
      <h2 className="next-matchups-header">Upcoming Matchups</h2>
      <div className="matchups-grid">
        {sports.map((sport, index) => (
          <div key={index} className="matchups-sport-section">
            <h2 className="matchups-sport-header">
              {sport.charAt(0).toUpperCase() + sport.slice(1)}
            </h2>
            <ul className="next-matchups-list">
              {matchupsCache[sport] && matchupsCache[sport].length > 0 ? (
                <>
                  <li className="next-match">
                    <span className="next-matchups-teams">
                      {matchupsCache[sport][0].teamA} vs {matchupsCache[sport][0].teamB}
                    </span>
                    <div>
                      <OddsDisplay
                        teamA={matchupsCache[sport][0].teamA}
                        teamB={matchupsCache[sport][0].teamB}
                        sport={sport}
                        odds={getOddsForMatch(
                          matchupsCache[sport][0].teamA,
                          matchupsCache[sport][0].teamB,
                          sport
                        )}
                      />
                    </div>
                  </li>
                  {matchupsCache[sport].slice(1, 3).map((match, matchIndex) => (
                    <li key={matchIndex} className="following-match">
                      <span className="next-matchups-teams">
                        {match.teamA} vs {match.teamB}
                      </span>
                      <div>
                        <OddsDisplay
                          teamA={match.teamA}
                          teamB={match.teamB}
                          sport={sport}
                          odds={getOddsForMatch(match.teamA, match.teamB, sport)}
                        />
                      </div>
                    </li>
                  ))}
                </>
              ) : (
                <li>No upcoming matches</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

const OddsDisplay = ({ teamA, teamB, sport, odds }) => {
  if (!odds) return <div>Loading odds...</div>;

  return (
    <div className="next-matchups-odds">
      {odds.oddsTeamA} | Draw: {odds.oddsDraw} | {odds.oddsTeamB}
    </div>
  );
};

export default NextMatchups;
