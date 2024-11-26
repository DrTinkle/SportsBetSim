const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const initializeBank = require('./startup/bank_initializer');
const initializeSchedule = require('./startup/scheduler');
const initializeTeams = require('./startup/team_randomizer');

const { getTeamMatchHistory } = require('./utils/history_processor');
const { getNextMatchups } = require('./utils/next_matchups');
const { calculateOddsForMatchup } = require('./calculations/odds_calculator');
const { processNextMatches } = require('./utils/match_processor');
const { processBets } = require('./utils/bet_handler');

const activeSessions = new Map();
const SESSION_TIMEOUT = 10 * 60 * 1000;

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: 'https://sportsbetsim-front.onrender.com',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

function loadJsonData(filePath) {
  const fullPath = path.join(__dirname, './data', filePath);
  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch (error) {
    console.error(`Error loading JSON from ${filePath}:`, error);
    return [];
  }
}

function saveJsonData(filePath, data) {
  const fullPath = path.join(__dirname, './data', filePath);
  try {
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Successfully saved JSON to ${filePath}`);
  } catch (error) {
    console.error(`Error saving JSON to ${filePath}:`, error);
  }
}

function initializeAllData() {
  console.log('Reinitializing all data...');
  initializeBank();
  initializeTeams();
  initializeSchedule();
  console.log('All data has been reinitialized.');
}

initializeAllData();

function shouldResetSession(playerID) {
  const lastActive = activeSessions.get(playerID);
  const now = Date.now();

  if (!lastActive || now - lastActive > SESSION_TIMEOUT) {
    activeSessions.set(playerID, now);
    return true;
  }

  return false;
}

app.use((req, res, next) => {
  const playerID = req.headers['x-player-id'] || 'anonymous';
  console.log(`Received request from player: ${playerID}`);

  if (shouldResetSession(playerID)) {
    console.log(`Resetting data for player: ${playerID}`);
    initializeAllData();
  } else {
    console.log(`No reset needed for player: ${playerID}`);
  }

  next();
});

app.post('/api/reset', (req, res) => {
  try {
    initializeAllData();
    res.json({ success: true, message: 'All data has been reinitialized.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to reinitialize data.' });
  }
});

app.get('/api/teamNames', (req, res) => {
  try {
    const teamNames = loadJsonData('team_names.json');
    res.json(teamNames);
  } catch (err) {
    console.error('Error loading team names:', err);
    res.status(500).json({ error: 'Failed to load team name data' });
  }
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

app.post('/api/saveTicket', (req, res) => {
  let tickets = loadJsonData('tickets.json');

  const generateUniqueNumericId = () => {
    const min = 10000;
    const max = 99999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  let newTicketId;

  while (true) {
    const candidateId = generateUniqueNumericId();
    const isDuplicate = tickets.some((ticket) => ticket.ticketId === candidateId);

    if (!isDuplicate) {
      newTicketId = candidateId;
      break;
    }
  }

  const newTicket = {
    ...req.body,
    ticketId: newTicketId,
    results: {},
    totalWinnings: 0,
    combinationsProcessed: false,
    ticketProcessed: false,
  };

  tickets.push(newTicket);
  saveJsonData('tickets.json', tickets);

  res.json({ success: true, ticket: newTicket });
});

app.get('/api/getTickets', (req, res) => {
  try {
    const tickets = loadJsonData('tickets.json');
    res.json(tickets);
  } catch (err) {
    console.error('Error reading tickets file:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve tickets.' });
  }
});

app.get('/api/processBets', (req, res) => {
  try {
    processBets();
    res.json({ success: true, message: 'Bet processing complete.' });
  } catch (error) {
    console.error('Error processing bets:', error);
    res.status(500).json({ success: false, error: 'Failed to process bets.' });
  }
});

app.get('/api/bank', (req, res) => {
  try {
    const bankData = loadJsonData('bank.json');
    res.json(bankData);
  } catch (error) {
    console.error('Error reading bank data:', error);
    res.status(500).json({ error: 'Failed to retrieve bank data.' });
  }
});

app.post('/api/bank/adjust-balance', (req, res) => {
  try {
    const { amount } = req.body;
    const bankData = loadJsonData('bank.json');

    if (!bankData) {
      return res.status(500).json({ error: 'Failed to load bank data' });
    }

    bankData.balance = Math.max(0, bankData.balance + amount);

    saveJsonData('bank.json', bankData);
    res.json({ success: true, balance: bankData.balance });
  } catch (error) {
    console.error('Error updating bank balance:', error);
    res.status(500).json({ error: 'Failed to update bank balance' });
  }
});

app.delete('/api/tickets/:ticketId', (req, res) => {
  const { ticketId } = req.params;
  const tickets = loadJsonData('tickets.json');
  const updatedTickets = tickets.filter((ticket) => ticket.ticketId !== parseInt(ticketId));

  if (updatedTickets.length === tickets.length) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  saveJsonData('tickets.json', updatedTickets);
  res.json({ success: true, message: `Ticket ${ticketId} deleted successfully` });
});

app.post('/api/tickets/:ticketId/archive', (req, res) => {
  const { ticketId } = req.params;
  const tickets = loadJsonData('tickets.json');
  const ticketToArchive = tickets.find((ticket) => ticket.ticketId === parseInt(ticketId));

  if (!ticketToArchive) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  const remainingTickets = tickets.filter((ticket) => ticket.ticketId !== parseInt(ticketId));
  saveJsonData('tickets.json', remainingTickets);

  const archivedTickets = loadJsonData('ticket_archive.json');
  archivedTickets.push(ticketToArchive);
  saveJsonData('ticket_archive.json', archivedTickets);

  res.json({ success: true, message: `Ticket ${ticketId} archived successfully` });
});

app.get('/api/tickets/archived', (req, res) => {
  const archivedTickets = loadJsonData('ticket_archive.json');
  res.json(archivedTickets);
});

app.delete('/api/tickets/archived/:ticketId', (req, res) => {
  const { ticketId } = req.params;
  const tickets = loadJsonData('ticket_archive.json');
  const updatedTickets = tickets.filter((ticket) => ticket.ticketId !== parseInt(ticketId));

  if (updatedTickets.length === tickets.length) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  saveJsonData('ticket_archive.json', updatedTickets);
  res.json({ success: true, message: `Ticket ${ticketId} deleted successfully` });
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
