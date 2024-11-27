const initializeBank = require('./bank_initializer');
const initializeTeams = require('./team_randomizer');
const initializeSchedule = require('./scheduler');
const { loadJsonData } = require('../utils/json_helpers');

function initializePlayerData(req) {
  const playerID = req?.playerID;

  if (!playerID) {
    console.error('PlayerID not found in req:', req);
    throw new Error('PlayerID is required to initialize player data.');
  }

  const existingTeamsData = loadJsonData('teams.json', req);
  if (existingTeamsData.length > 0) {
    console.log(`Player data already exists for playerID: ${playerID}. Skipping initialization.`);
    return;
  }

  console.log(`Initializing player data for playerID: ${playerID}...`);
  initializeBank(req);
  initializeTeams(req);
  initializeSchedule(req);
  console.log(`Player data initialized for playerID: ${playerID}.`);
}

module.exports = initializePlayerData;
