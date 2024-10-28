const express = require('express');
const path = require('path');
const fs = require('fs');

require('./startup/team_randomizer');
require('./startup/scheduler');

const { getTeamMatchHistory } = require('./utils/history_processor');
const { getNextMatchups } = require('./utils/next_matchups');
const { calculateOddsForMatchup } = require('./calculations/odds_calculator');
const { processNextMatches } = require('./utils/match_processor');

const app = express();
const PORT = process.env.PORT || 5000;

function loadJsonData(filePath) {
  const fullPath = path.join(__dirname, './data', filePath);
  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch (error) {
    console.error(`Error loading JSON from ${filePath}:`, error);
    return [];
  }
}

app.get('/api/teamNames', (req, res) => {
  const teamsPath = path.join(__dirname, './data/team_names.json');

  fs.readFile(teamsPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to load team name data' });
    }
    res.json(JSON.parse(data));
  });
});

app.get('/api/team-match-history/:teamName', (req, res) => {
  const teamName = req.params.teamName;
  const matchHistory = getTeamMatchHistory(teamName);

  if (matchHistory.error) {
    return res.status(404).json({ error: matchHistory.error });
  }

  res.json(matchHistory);
});

app.get('/api/nextMatchups/:sport', (req, res) => {
  const sport = req.params.sport;
  const nextMatchups = getNextMatchups(sport);
  res.json(nextMatchups);
});

app.get('/api/odds', async (req, res) => {
  const { teamA, teamB, isNextMatch, sport } = req.query;

  if (!teamA || !teamB) {
    return res.status(400).json({ error: 'Missing teamA or teamB in query' });
  }

  try {
    const odds = await calculateOddsForMatchup(teamA, teamB, isNextMatch, sport);
    res.json(odds);
  } catch (error) {
    console.error('Error calculating odds:', error);
    res.status(500).json({ error: 'Failed to calculate odds' });
  }
});

app.post('/api/processNextMatches', (req, res) => {
  try {
    processNextMatches();
    res.json({ success: true, message: 'Next matches processed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/recentProcessedMatches', (req, res) => {
  try {
    const matchHistory = loadJsonData('match_history.json');
    const recentProcessedMatches = {};

    Object.keys(matchHistory).forEach((sport) => {
      recentProcessedMatches[sport] = matchHistory[sport].matchups.filter(
        (match) => match.processedDuringGame === true
      );
    });

    res.json(recentProcessedMatches);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching processed matches' });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
