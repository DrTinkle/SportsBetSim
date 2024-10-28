import React from 'react';
import MatchHistory from './MatchHistory';
import NextMatchups from './NextMatchups';

const MatchupsParent = ({ matchupsCache, oddsCache, refreshKey }) => {
  return (
    <div>
      <NextMatchups matchupsCache={matchupsCache} oddsCache={oddsCache} refreshKey={refreshKey} />

      <MatchHistory refreshKey={refreshKey} />
    </div>
  );
};

export default MatchupsParent;
