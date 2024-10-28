const fs = require('fs');
const path = require('path');
const rootPath = path.join(__dirname, '../');
const { compareStats } = require('../../shared/calculations');

function loadJsonData(filePath) {
  const fullPath = path.join(rootPath, '/data', filePath);
  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch (error) {
    console.error(`Error loading JSON from ${filePath}:`, error);
    return [];
  }
}

function saveJsonData(filePath, data) {
  const fullPath = path.join(rootPath, '/data', filePath);
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf8');
}

function findTeam(teamsData, teamName) {
  for (const sportData of teamsData) {
    const team = sportData.teams.find((t) => t.name === teamName);
    if (team) {
      return team;
    }
  }
  return null;
}

async function calculateOddsForMatchup(teamA, teamB, isNextMatch = false, sport = '') {
  const teamStats = await gatherTeamStats(teamA, teamB);
  const teamsData = loadJsonData('teams.json');

  const teamAData = findTeam(teamsData, teamA);
  const teamBData = findTeam(teamsData, teamB);

  if (!teamAData || !teamBData) {
    console.error('One of the teams could not be found in teams.json.');
    return;
  }

  const teamSkills = compareStats(teamAData, teamBData);

  const {
    headToHeadTotalScoreTeamA,
    headToHeadTotalScoreTeamB,
    headToHeadTeamAWins,
    headToHeadTeamBWins,
    headToHeadDraws,
    headToHeadTotalMatches,
    overallTotalGamesTeamA,
    overallTotalGamesTeamB,
    overallTeamAWins,
    overallTeamBWins,
    overallTeamADraws,
    overallTeamBDraws,
    overallTotalScoreTeamA,
    overallTotalScoreTeamB,
  } = teamStats;

  const { scoreTeamA, scoreTeamB } = teamSkills;

  const totalStatsScore = scoreTeamA + scoreTeamB;
  const statComparisonA = totalStatsScore > 0 ? scoreTeamA / totalStatsScore : 0.5;
  const statComparisonB = totalStatsScore > 0 ? scoreTeamB / totalStatsScore : 0.5;

  const avgHeadToHeadScoreTeamA = headToHeadTotalScoreTeamA / (headToHeadTotalMatches || 1);
  const avgHeadToHeadScoreTeamB = headToHeadTotalScoreTeamB / (headToHeadTotalMatches || 1);

  const avgOverallScoreTeamA = overallTotalScoreTeamA / (overallTotalGamesTeamA || 1);
  const avgOverallScoreTeamB = overallTotalScoreTeamB / (overallTotalGamesTeamB || 1);

  const headToHeadWinRateTeamA = headToHeadTeamAWins / (headToHeadTotalMatches || 1);
  const headToHeadWinRateTeamB = headToHeadTeamBWins / (headToHeadTotalMatches || 1);
  const drawRate = headToHeadDraws / (headToHeadTotalMatches || 1);

  const overallWinRateTeamA = overallTeamAWins / (overallTotalGamesTeamA || 1);
  const overallWinRateTeamB = overallTeamBWins / (overallTotalGamesTeamB || 1);
  const overallDrawRateTeamA = overallTeamADraws / (overallTotalGamesTeamA || 1);
  const overallDrawRateTeamB = overallTeamBDraws / (overallTotalGamesTeamB || 1);

  const headToHeadWeight = 0.35;
  const overallPerformanceWeight = 0.35;
  const statComparisonWeight = 0.15;
  const avgScoreWeight = 0.15;

  const rawProbabilityTeamA =
    headToHeadWeight * headToHeadWinRateTeamA +
    overallPerformanceWeight * overallWinRateTeamA +
    statComparisonWeight * statComparisonA +
    (avgScoreWeight * (avgHeadToHeadScoreTeamA + avgOverallScoreTeamA)) / 2;

  const rawProbabilityTeamB =
    headToHeadWeight * headToHeadWinRateTeamB +
    overallPerformanceWeight * overallWinRateTeamB +
    statComparisonWeight * statComparisonB +
    (avgScoreWeight * (avgHeadToHeadScoreTeamB + avgOverallScoreTeamB)) / 2;

  const rawProbabilityDraw =
    headToHeadWeight * drawRate +
    (overallPerformanceWeight * (overallDrawRateTeamA + overallDrawRateTeamB)) / 2 +
    statComparisonWeight * 0.1 +
    avgScoreWeight * 0.1;

  const totalRaw = rawProbabilityTeamA + rawProbabilityTeamB + rawProbabilityDraw;

  if (totalRaw > 0) {
    let oddsTeamA = rawProbabilityTeamA / totalRaw;
    let oddsTeamB = rawProbabilityTeamB / totalRaw;
    let oddsDraw = rawProbabilityDraw / totalRaw;

    oddsTeamA = oddsTeamA > 0 ? (1 / oddsTeamA).toFixed(2) : null;
    oddsTeamB = oddsTeamB > 0 ? (1 / oddsTeamB).toFixed(2) : null;
    oddsDraw = oddsDraw > 0 ? (1 / oddsDraw).toFixed(2) : null;

    const odds = {
      teamA,
      teamB,
      oddsTeamA,
      oddsDraw,
      oddsTeamB,
    };

    if (isNextMatch && sport) {
      const scheduleData = loadJsonData('schedule.json');
      const nextMatch = scheduleData[sport]?.matchups[0];

      if (nextMatch && !nextMatch.oddsTeamA && !nextMatch.oddsTeamB && !nextMatch.oddsDraw) {
        nextMatch.oddsTeamA = odds.oddsTeamA;
        nextMatch.oddsDraw = odds.oddsDraw;
        nextMatch.oddsTeamB = odds.oddsTeamB;

        saveJsonData('schedule.json', scheduleData);
        console.log(`Odds saved to schedule.json for the next match: ${teamA} vs ${teamB}`);
      }
    }

    return {
      teamA,
      teamB,
      oddsTeamA,
      oddsDraw,
      oddsTeamB,
    };
  } else {
    console.error('Error: Raw probabilities sum to zero, invalid results.');
    return null;
  }
}

async function gatherTeamStats(teamA, teamB) {
  const teamHistory = await loadJsonData('team_history.json');
  const matchHistory = await loadJsonData('match_history.json');

  let headToHeadTotalScoreTeamA = 0;
  let headToHeadTotalScoreTeamB = 0;
  let headToHeadTeamAWins = 0;
  let headToHeadTeamBWins = 0;
  let headToHeadDraws = 0;
  let headToHeadTotalMatches = 0;

  let overallTotalGamesTeamA = 0;
  let overallTotalGamesTeamB = 0;
  let overallTeamAWins = 0;
  let overallTeamBWins = 0;
  let overallTeamADraws = 0;
  let overallTeamBDraws = 0;
  let overallTotalScoreTeamA = 0;
  let overallTotalScoreTeamB = 0;

  const teamAMatchIds = teamHistory[teamA]?.matches || [];
  const teamBMatchIds = teamHistory[teamB]?.matches || [];

  Object.entries(matchHistory).forEach(([sport, sportData]) => {
    const matchups = sportData.matchups || [];

    matchups.forEach((match) => {
      if (
        teamAMatchIds.includes(match.matchId) &&
        teamBMatchIds.includes(match.matchId) &&
        ((match.teamA === teamA && match.teamB === teamB) ||
          (match.teamA === teamB && match.teamB === teamA))
      ) {
        headToHeadTotalMatches++;

        if (match.teamA === teamA) {
          headToHeadTotalScoreTeamA += match.scoreTeamA;
          headToHeadTotalScoreTeamB += match.scoreTeamB;
        } else {
          headToHeadTotalScoreTeamA += match.scoreTeamB;
          headToHeadTotalScoreTeamB += match.scoreTeamA;
        }

        if (match.winner === teamA) {
          headToHeadTeamAWins++;
        } else if (match.winner === teamB) {
          headToHeadTeamBWins++;
        } else if (match.winner === 'draw') {
          headToHeadDraws++;
        }
      }

      if (match.teamA === teamA || match.teamB === teamA) {
        overallTotalGamesTeamA++;
        if (match.teamA === teamA) {
          overallTotalScoreTeamA += match.scoreTeamA;
        } else {
          overallTotalScoreTeamA += match.scoreTeamB;
        }
        if (match.winner === teamA) {
          overallTeamAWins++;
        } else if (match.winner === 'draw') {
          overallTeamADraws++;
        }
      }

      if (match.teamA === teamB || match.teamB === teamB) {
        overallTotalGamesTeamB++;
        if (match.teamA === teamB) {
          overallTotalScoreTeamB += match.scoreTeamA;
        } else {
          overallTotalScoreTeamB += match.scoreTeamB;
        }
        if (match.winner === teamB) {
          overallTeamBWins++;
        } else if (match.winner === 'draw') {
          overallTeamBDraws++;
        }
      }
    });
  });

  return {
    headToHeadTotalScoreTeamA,
    headToHeadTotalScoreTeamB,
    headToHeadTeamAWins,
    headToHeadTeamBWins,
    headToHeadDraws,
    headToHeadTotalMatches,
    overallTotalGamesTeamA,
    overallTotalGamesTeamB,
    overallTeamAWins,
    overallTeamBWins,
    overallTeamADraws,
    overallTeamBDraws,
    overallTotalScoreTeamA,
    overallTotalScoreTeamB,
  };
}

module.exports = { calculateOddsForMatchup };
