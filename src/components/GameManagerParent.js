import React, { useState, useEffect } from 'react';
import BettingParent from './BettingParent';
import MatchupsParent from './MatchupsParent';
import ProcessNextMatchesButton from './ProcessNextMatchesButton';
import AccountModal from './AccountModal';
import BackstoryModal from './BackstoryModal';

const GameManagerParent = () => {
  const [matchupsCache, setMatchupsCache] = useState({});
  const [oddsCache, setOddsCache] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isBackstoryModalOpen, setIsBackstoryModalOpen] = useState(true);
  const [bankData, setBankData] = useState(undefined);

  useEffect(() => {
    const fetchNextMatchupsAndOdds = async () => {
      const sports = ['boxing', 'soccer', 'hockey'];
      const fetchedMatchups = {};
      const fetchedOdds = {};

      try {
        for (const sport of sports) {
          const response = await fetch(`/api/nextMatchups/${sport}`, {
            method: 'GET',
            credentials: 'include',
          });
          const matchData = await response.json();
          fetchedMatchups[sport] = matchData;

          for (let i = 0; i < matchData.length; i++) {
            const match = matchData[i];
            const isNextMatch = i === 0;
            const oddsResponse = await fetch(
              `/api/odds?teamA=${match.teamA}&teamB=${match.teamB}&isNextMatch=${isNextMatch}&sport=${sport}`,
              {
                method: 'GET',
                credentials: 'include',
              }
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

  const updateBankData = async () => {
    try {
      const response = await fetch('/api/bank', {
        method: 'GET',
        credentials: 'include',
      });
      const fetchedBankData = await response.json();
      setBankData(fetchedBankData);
    } catch (error) {
      console.error('Error fetching bank data:', error);
    }
  };

  useEffect(() => {
    updateBankData();
  }, []);

  const handleProcessed = () => {
    setRefreshKey((prevKey) => prevKey + 1);
    updateBankData();
  };

  const toggleAccountModal = () => {
    setIsAccountModalOpen((prev) => !prev);
  };

  const closeBackstoryModal = () => {
    setIsBackstoryModalOpen(false);
  };

  if (bankData === undefined) {
    return <p>Loading bank data...</p>;
  }

  return (
    <div className="game-manager">
      {isBackstoryModalOpen && <BackstoryModal onClose={closeBackstoryModal} />}{' '}
      {/* Backstory modal */}
      <ProcessNextMatchesButton onProcessed={handleProcessed} />
      <button className="account-button" onClick={toggleAccountModal}>
        Account
      </button>
      <AccountModal isOpen={isAccountModalOpen} onClose={toggleAccountModal} bankData={bankData} />
      <BettingParent
        matchupsCache={matchupsCache}
        oddsCache={oddsCache}
        refreshKey={refreshKey}
        updateBankData={updateBankData}
      />
      <MatchupsParent matchupsCache={matchupsCache} oddsCache={oddsCache} refreshKey={refreshKey} />
    </div>
  );
};

export default GameManagerParent;
