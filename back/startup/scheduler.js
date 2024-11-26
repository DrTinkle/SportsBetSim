const { compareStats, generateScore } = require('../calculations/calculations');
const { loadJsonData, saveJsonData } = require('../utils/json_helpers');

let matchCounter = 1;
let teamHistory = [];
let matchHistory = [];

function generateSchedule(iterations = 1) {
  const teamsData = loadJsonData('teams.json');
  let scheduleData = {};
  let matchHistoryData = {};

  teamsData.forEach((sport) => {
    scheduleData[sport.sport] = {
      matchups: generateTournamentSchedule(sport.teams),
    };

    let pastMatchups = [];
    for (let i = 0; i < iterations; i++) {
      const startOrder = pastMatchups.length + 1;
      const currentMatchups = generateTournamentSchedule(sport.teams).map((match, index) => ({
        ...match,
        order: startOrder + index,
      }));
      pastMatchups = pastMatchups.concat(currentMatchups);
    }

    matchHistoryData[sport.sport] = {
      matchups: pastMatchups,
    };
  });

  randomizePastMatchResults(matchHistoryData);

  saveJsonData('schedule.json', scheduleData);
  console.log('schedule.json saved');
}

function generateTournamentSchedule(teams) {
  let matchups = [];

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matchups.push({
        teamA: teams[i].name,
        teamB: teams[j].name,
        matchId: matchCounter++,
        scoreTeamA: 0,
        scoreTeamB: 0,
        winner: null,
      });
    }
  }

  matchups = fisherYatesShuffle(matchups);

  const teamMatchCounts = {};

  teams.forEach((team) => {
    teamMatchCounts[team.name] = { teamA: 0, teamB: 0 };
  });

  matchups.forEach((matchup) => {
    const { teamA, teamB } = matchup;

    if (
      teamMatchCounts[teamA].teamA > teamMatchCounts[teamA].teamB &&
      teamMatchCounts[teamB].teamB > teamMatchCounts[teamB].teamA
    ) {
      [matchup.teamA, matchup.teamB] = [teamB, teamA];
    }

    teamMatchCounts[matchup.teamA].teamA += 1;
    teamMatchCounts[matchup.teamB].teamB += 1;
  });

  matchups.forEach((matchup, index) => {
    matchup.order = index + 1;
  });

  return matchups;
}

function fisherYatesShuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function randomizePastMatchResults(scheduleData) {
  clearHistories();

  Object.entries(scheduleData).forEach(([sport, sportData]) => {
    if (sportData.matchups) {
      sportData.matchups.forEach((match, index) => {
        const teamA = match.teamA;
        const teamB = match.teamB;

        const { scoreA, scoreB } = compareStats(teamHistory[teamA] || {}, teamHistory[teamB] || {});
        const { scoreTeamA, scoreTeamB } = generateScore(sport, scoreA, scoreB);

        match.scoreTeamA = scoreTeamA;
        match.scoreTeamB = scoreTeamB;
        match.winner = scoreTeamA > scoreTeamB ? teamA : scoreTeamB > scoreTeamA ? teamB : 'draw';
        match.order = index + 1;
        match.matchId = match.matchId || `match_${matchHistory.length + 1}`;

        if (!teamHistory[teamA]) {
          teamHistory[teamA] = { matches: [], wins: 0, losses: 0, ties: 0, totalPoints: 0 };
        }
        if (!teamHistory[teamB]) {
          teamHistory[teamB] = { matches: [], wins: 0, losses: 0, ties: 0, totalPoints: 0 };
        }

        if (match.winner === teamA) {
          teamHistory[teamA].wins += 1;
          teamHistory[teamB].losses += 1;
        } else if (match.winner === teamB) {
          teamHistory[teamB].wins += 1;
          teamHistory[teamA].losses += 1;
        } else {
          teamHistory[teamA].ties += 1;
          teamHistory[teamB].ties += 1;
        }

        teamHistory[teamA].totalPoints += scoreTeamA;
        teamHistory[teamB].totalPoints += scoreTeamB;

        teamHistory[teamA].matches.push(match.matchId);
        teamHistory[teamB].matches.push(match.matchId);
      });
    }
  });

  Object.entries(teamHistory).forEach(([teamName, team]) => {
    const totalMatches = team.wins + team.losses + team.ties;
    team.pointsPerMatch = totalMatches ? (team.totalPoints / totalMatches).toFixed(2) : 0;
  });

  saveJsonData('match_history.json', scheduleData);
  saveJsonData('team_history.json', teamHistory);
  console.log('match_history.json and team_history.json saved');
}

function clearHistories() {
  matchHistory = [];
  saveJsonData('match_history.json', matchHistory);

  teamHistory = {};
  saveJsonData('team_history.json', teamHistory);

  console.log('Team and match history cleared.');

  let tickets = [];
  let ticketArchive = [];

  saveJsonData('tickets.json', tickets);
  saveJsonData('ticket_archive.json', ticketArchive);

  console.log('Betting tickets and archive cleared.');
}

function initializeSchedule() {
  try {
    generateSchedule(2);
  } catch (error) {
    console.error(error.message);
  }
}

module.exports = initializeSchedule;
