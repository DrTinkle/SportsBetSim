const fs = require('fs');
const path = require('path');
const { generateScore } = require('../../shared/calculations');

function loadJsonData(filePath) {
  const fullPath = path.join(__dirname, '../data/', filePath);
  return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
}

function saveJsonData(filePath, data) {
  const fullPath = path.join(__dirname, '../data/', filePath);
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf-8');
}

function getLatestOrder(matchHistory, sport) {
  if (matchHistory[sport] && matchHistory[sport].matchups.length > 0) {
    const latestMatch = matchHistory[sport].matchups.reduce((prev, current) =>
      prev.order > current.order ? prev : current
    );
    return latestMatch.order;
  }
  return 0;
}

function processNextMatches() {
  const scheduleData = loadJsonData('schedule.json');
  let matchHistoryData = loadJsonData('match_history.json');
  let teamHistoryData = loadJsonData('team_history.json');

  Object.keys(scheduleData).forEach((sport) => {
    const sportMatchups = scheduleData[sport]?.matchups;

    if (sportMatchups.length > 0) {
      const nextMatch = sportMatchups.shift();
      const { teamA, teamB } = nextMatch;

      const { scoreTeamA, scoreTeamB } = generateScore(
        sport,
        nextMatch.scoreTeamA,
        nextMatch.scoreTeamB
      );
      nextMatch.scoreTeamA = scoreTeamA;
      nextMatch.scoreTeamB = scoreTeamB;
      nextMatch.winner = scoreTeamA > scoreTeamB ? teamA : scoreTeamB > scoreTeamA ? teamB : 'draw';

      const latestOrder = getLatestOrder(matchHistoryData, sport);
      nextMatch.order = latestOrder + 1;

      nextMatch.processedDuringGame = true;

      if (!matchHistoryData[sport]) {
        matchHistoryData[sport] = { matchups: [] };
      }
      matchHistoryData[sport].matchups.push(nextMatch);

      [teamA, teamB].forEach((team) => {
        if (!teamHistoryData[team]) {
          teamHistoryData[team] = { matches: [] };
        }
        teamHistoryData[team].matches.push(nextMatch.matchId);
      });

      console.log('Processed scores:');
      console.log(scoreTeamA, scoreTeamB);
    }
  });

  saveJsonData('schedule.json', scheduleData);
  saveJsonData('match_history.json', matchHistoryData);
  saveJsonData('team_history.json', teamHistoryData);

  console.log('Processed next matches and updated history.');
}

module.exports = { processNextMatches };
