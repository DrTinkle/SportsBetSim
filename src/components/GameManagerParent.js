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
  const [bankData, setBankData] = useState({
    balance: 2000,
    loans: [{ amount: 2000, interestRate: 10, daysRemaining: 30 }],
    rentDue: 500,
    daysRemaining: 7,
  });

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

  const updateBankData = async () => {
    try {
      const response = await fetch('/api/bank');
      const updatedBankData = await response.json();
      setBankData(updatedBankData);
    } catch (error) {
      console.error('Error fetching bank data:', error);
    }
  };

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
