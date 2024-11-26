const { generateScore } = require('../calculations/calculations');
const { loadJsonData, saveJsonData } = require('./json_helpers');

function getLatestOrder(matchHistory, sport) {
  if (matchHistory[sport] && matchHistory[sport].matchups.length > 0) {
    const latestMatch = matchHistory[sport].matchups.reduce((prev, current) =>
      prev.order > current.order ? prev : current
    );
    return latestMatch.order;
  }
  return 0;
}

function processNextMatches(req) {
  const scheduleData = loadJsonData('schedule.json', req);
  let matchHistoryData = loadJsonData('match_history.json', req);
  let teamHistoryData = loadJsonData('team_history.json', req);

  Object.keys(scheduleData).forEach((sport) => {
    const sportMatchups = scheduleData[sport]?.matchups;

    if (sportMatchups && sportMatchups.length > 0) {
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
          teamHistoryData[team] = {
            matches: [],
            wins: 0,
            losses: 0,
            ties: 0,
            totalPoints: 0,
          };
        }

        teamHistoryData[team].matches.push(nextMatch.matchId);

        if (nextMatch.winner === team) {
          teamHistoryData[team].wins += 1;
        } else if (nextMatch.winner === 'draw') {
          teamHistoryData[team].ties += 1;
        } else {
          teamHistoryData[team].losses += 1;
        }

        if (team === teamA) {
          teamHistoryData[team].totalPoints += scoreTeamA;
        } else if (team === teamB) {
          teamHistoryData[team].totalPoints += scoreTeamB;
        }

        const totalMatches =
          teamHistoryData[team].wins + teamHistoryData[team].losses + teamHistoryData[team].ties;
        teamHistoryData[team].pointsPerMatch = totalMatches
          ? (teamHistoryData[team].totalPoints / totalMatches).toFixed(2)
          : 0;
      });

      console.log('Processed scores:');
      console.log(scoreTeamA, scoreTeamB);
    }
  });

  saveJsonData('schedule.json', scheduleData, req);
  saveJsonData('match_history.json', matchHistoryData, req);
  saveJsonData('team_history.json', teamHistoryData, req);

  console.log('Processed next matches and updated history.');
}

module.exports = { processNextMatches };
