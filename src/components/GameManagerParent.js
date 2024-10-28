import React, { useState, useEffect } from 'react';
import BettingParent from './BettingParent';
import MatchupsParent from './MatchupsParent';
import ProcessNextMatchesButton from './ProcessNextMatchesButton';

const GameManagerParent = () => {
  const [matchupsCache, setMatchupsCache] = useState({});
  const [oddsCache, setOddsCache] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchNextMatchupsAndOdds = async () => {
      const sports = ['boxing', 'soccer', 'hockey'];
      const fetchedMatchups = {};
      const fetchedOdds = {};

      try {
        for (const sport of sports) {
          const response = await fetch(`/api/nextMatchups/${sport}`);
          const matchData = await response.json();
          fetchedMatchups[sport] = matchData;

          for (let i = 0; i < matchData.length; i++) {
            const match = matchData[i];
            const isNextMatch = i === 0;
            const oddsResponse = await fetch(
              `/api/odds?teamA=${match.teamA}&teamB=${match.teamB}&isNextMatch=${isNextMatch}&sport=${sport}`
            );
            const oddsData = await oddsResponse.json();

            const cacheKey = `${match.teamA}-${match.teamB}-${sport}`;
            fetchedOdds[cacheKey] = {
              oddsTeamA: oddsData.oddsTeamA,
              oddsDraw: oddsData.oddsDraw,
              oddsTeamB: oddsData.oddsTeamB,
            };
          }
        }

        setMatchupsCache(fetchedMatchups);
        setOddsCache(fetchedOdds);
      } catch (error) {
        console.error('Error fetching matchups or odds:', error);
      }
    };

    fetchNextMatchupsAndOdds();
  }, [refreshKey]);

  const handleProcessed = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  return (
    <div className="game-manager">
      {/* "Next Day" button */}
      <ProcessNextMatchesButton onProcessed={handleProcessed} />

      <BettingParent matchupsCache={matchupsCache} oddsCache={oddsCache} />

      <MatchupsParent matchupsCache={matchupsCache} oddsCache={oddsCache} refreshKey={refreshKey} />
    </div>
  );
};

export default GameManagerParent;
