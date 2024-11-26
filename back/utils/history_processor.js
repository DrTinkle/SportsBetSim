const { loadJsonData } = require('./json_helpers');

const getTeamMatchHistory = (teamName, req) => {
  const teamHistory = loadJsonData('team_history.json', req);
  const matchHistory = loadJsonData('match_history.json', req);

  if (!teamHistory[teamName]) {
    return { error: 'Team not found' };
  }

  const teamData = teamHistory[teamName];
  const teamMatchIds = teamData.matches;

  const matches = [];
  Object.keys(matchHistory).forEach((sport) => {
    matchHistory[sport].matchups.forEach((match) => {
      if (teamMatchIds.includes(match.matchId)) {
        matches.push(match);
      }
    });
  });

  const totalMatches = teamData.wins + teamData.losses + teamData.ties;
  const pointsPerMatch = totalMatches > 0 ? (teamData.totalPoints / totalMatches).toFixed(2) : 0;

  return {
    teamName,
    matches: matches.length > 0 ? matches : [],
    stats: {
      wins: teamData.wins,
      losses: teamData.losses,
      ties: teamData.ties,
      totalPoints: teamData.totalPoints,
      pointsPerMatch,
    },
  };
};

module.exports = { getTeamMatchHistory };
