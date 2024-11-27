const express = require('express');
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const cookieParser = require('cookie-parser');

const playerRoutes = require('./routes/player_routes');

const { loadJsonData, saveJsonData, loadJsonDataFromPath } = require('./utils/json_helpers');

const { getTeamMatchHistory } = require('./utils/history_processor');
const { getNextMatchups } = require('./utils/next_matchups');
const { calculateOddsForMatchup } = require('./calculations/odds_calculator');
const { processNextMatches } = require('./utils/match_processor');
const { processBets } = require('./utils/bet_handler');

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: 'https://sportsbetsim-front.onrender.com',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Middleware to handle playerID
app.use((req, res, next) => {
  if (!req.cookies.playerID) {
    const newPlayerID = uuidv4();
    res.cookie('playerID', newPlayerID, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'None',
    });
    req.playerID = newPlayerID;
    console.log(`Assigned new playerID: ${newPlayerID}`);
  } else {
    req.playerID = req.cookies.playerID;
    console.log(`Existing playerID: ${req.playerID}`);
  }
  next();
});

app.use('/api', playerRoutes);

app.get('/api/teamNames', (req, res) => {
  try {
    const teamNames = loadJsonDataFromPath('../startup/startup_data/team_names.json');
    res.json(teamNames);
  } catch (err) {
    console.error('Error loading team names:', err);
    res.status(500).json({ error: 'Failed to load team name data' });
  }
});

app.get('/api/team-match-history/:teamName', (req, res) => {
  const teamName = req.params.teamName;
  const matchHistory = getTeamMatchHistory(teamName, req);
  if (matchHistory.error) {
    return res.status(404).json({ error: matchHistory.error });
  }
  res.json(matchHistory);
});

app.get('/api/nextMatchups/:sport', (req, res) => {
  const sport = req.params.sport;
  const nextMatchups = getNextMatchups(sport, req);
  res.json(nextMatchups);
});

app.get('/api/odds', async (req, res) => {
  const { teamA, teamB, isNextMatch, sport } = req.query;
  if (!teamA || !teamB) {
    return res.status(400).json({ error: 'Missing teamA or teamB in query' });
  }
  try {
    const odds = await calculateOddsForMatchup(teamA, teamB, isNextMatch, sport, req);
    res.json(odds);
  } catch (error) {
    console.error('Error calculating odds:', error);
    res.status(500).json({ error: 'Failed to calculate odds' });
  }
});

app.post('/api/processNextMatches', (req, res) => {
  try {
    processNextMatches(req);
    res.json({ success: true, message: 'Next matches processed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/recentProcessedMatches', (req, res) => {
  try {
    const matchHistory = loadJsonData('match_history.json', req);
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
  let tickets = loadJsonData('tickets.json', req);

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
  saveJsonData('tickets.json', tickets, req);

  res.json({ success: true, ticket: newTicket });
});

app.get('/api/getTickets', (req, res) => {
  try {
    const tickets = loadJsonData('tickets.json', req);
    res.json(tickets);
  } catch (err) {
    console.error('Error reading tickets file:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve tickets.' });
  }
});

app.get('/api/processBets', (req, res) => {
  try {
    processBets(req);
    res.json({ success: true, message: 'Bet processing complete.' });
  } catch (error) {
    console.error('Error processing bets:', error);
    res.status(500).json({ success: false, error: 'Failed to process bets.' });
  }
});

app.get('/api/bank', (req, res) => {
  try {
    const bankData = loadJsonData('bank.json', req);
    res.json(bankData);
  } catch (error) {
    console.error('Error reading bank data:', error);
    res.status(500).json({ error: 'Failed to retrieve bank data.' });
  }
});

app.post('/api/bank/adjust-balance', (req, res) => {
  try {
    const { amount } = req.body;
    const bankData = loadJsonData('bank.json', req);

    if (!bankData) {
      return res.status(500).json({ error: 'Failed to load bank data' });
    }

    bankData.balance = Math.max(0, bankData.balance + amount);

    saveJsonData('bank.json', bankData, req);
    res.json({ success: true, balance: bankData.balance });
  } catch (error) {
    console.error('Error updating bank balance:', error);
    res.status(500).json({ error: 'Failed to update bank balance' });
  }
});

app.delete('/api/tickets/:ticketId', (req, res) => {
  const { ticketId } = req.params;
  const tickets = loadJsonData('tickets.json', req);
  const updatedTickets = tickets.filter((ticket) => ticket.ticketId !== parseInt(ticketId));

  if (updatedTickets.length === tickets.length) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  saveJsonData('tickets.json', updatedTickets, req);
  res.json({ success: true, message: `Ticket ${ticketId} deleted successfully` });
});

app.post('/api/tickets/:ticketId/archive', (req, res) => {
  const { ticketId } = req.params;
  const tickets = loadJsonData('tickets.json', req);
  const ticketToArchive = tickets.find((ticket) => ticket.ticketId === parseInt(ticketId));

  if (!ticketToArchive) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  const remainingTickets = tickets.filter((ticket) => ticket.ticketId !== parseInt(ticketId));
  saveJsonData('tickets.json', remainingTickets, req);

  const archivedTickets = loadJsonData('ticket_archive.json', req);
  archivedTickets.push(ticketToArchive);
  saveJsonData('ticket_archive.json', archivedTickets, req);

  res.json({ success: true, message: `Ticket ${ticketId} archived successfully` });
});

app.get('/api/tickets/archived', (req, res) => {
  const archivedTickets = loadJsonData('ticket_archive.json', req);
  res.json(archivedTickets);
});

app.delete('/api/tickets/archived/:ticketId', (req, res) => {
  const { ticketId } = req.params;
  const tickets = loadJsonData('ticket_archive.json', req);
  const updatedTickets = tickets.filter((ticket) => ticket.ticketId !== parseInt(ticketId));

  if (updatedTickets.length === tickets.length) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }

  saveJsonData('ticket_archive.json', updatedTickets, req);
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
