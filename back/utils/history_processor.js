const fs = require('fs');
const path = require('path');

const loadJsonData = (fileName) => {
  const filePath = path.join(__dirname, '../data', fileName);
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
};

const getTeamMatchHistory = (teamName) => {
  const teamHistory = loadJsonData('team_history.json');
  const matchHistory = loadJsonData('match_history.json');

  if (!teamHistory[teamName]) {
    return { error: 'Team not found' };
  }

  const teamMatchIds = teamHistory[teamName].matches;

  const matches = [];
  Object.keys(matchHistory).forEach((sport) => {
    matchHistory[sport].matchups.forEach((match) => {
      if (teamMatchIds.includes(match.matchId)) {
        matches.push(match);
      }
    });
  });

  return matches.length > 0 ? matches : { error: 'No match history found for this team' };
};

module.exports = { getTeamMatchHistory };
