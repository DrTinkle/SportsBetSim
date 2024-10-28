const { compareStats, generateScore } = require('../../shared/calculations');
const fs = require('fs');
const path = require('path');
const rootPath = path.join(__dirname, '../');
let matchCounter = 1;

let teamHistory = [];
let matchHistory = [];

function loadJsonData(filePath) {
  const fullPath = path.join(rootPath, 'data', filePath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`${filePath} not found. Please run the team randomizer first.`);
  }

  const data = fs.readFileSync(fullPath);
  return JSON.parse(data);
}

function saveJsonData(filePath, data) {
  const fullPath = path.join(rootPath, 'data', filePath);
  try {
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error saving file ${fullPath}:`, error);
  }
}

function generateSchedule() {
  const teamsData = loadJsonData('teams.json');
  let scheduleData = {};
  let matchHistoryData = {};

  teamsData.forEach((sport) => {
    scheduleData[sport.sport] = {
      matchups: generateTournamentSchedule(sport.teams),
    };
    matchHistoryData[sport.sport] = {
      matchups: generateTournamentSchedule(sport.teams),
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
        const teamA = teamHistory[match.teamA] || {};
        const teamB = teamHistory[match.teamB] || {};

        const { scoreA, scoreB } = compareStats(teamA, teamB);
        const { scoreTeamA, scoreTeamB } = generateScore(sport, scoreA, scoreB);

        match.scoreTeamA = scoreTeamA;
        match.scoreTeamB = scoreTeamB;
        match.winner =
          scoreTeamA > scoreTeamB ? match.teamA : scoreTeamB > scoreTeamA ? match.teamB : 'draw';
        match.order = index + 1;
        match.matchId = match.matchId || `match_${matchHistory.length + 1}`;

        if (!teamHistory[match.teamA]) {
          teamHistory[match.teamA] = { matches: [] };
        }
        if (!teamHistory[match.teamB]) {
          teamHistory[match.teamB] = { matches: [] };
        }
        teamHistory[match.teamA].matches.push(match.matchId);
        teamHistory[match.teamB].matches.push(match.matchId);
      });
    }
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
}

try {
  generateSchedule();
} catch (error) {
  console.error(error.message);
}
