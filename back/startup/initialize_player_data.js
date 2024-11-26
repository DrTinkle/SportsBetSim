const initializeBank = require('./bank_initializer');
const initializeTeams = require('./team_randomizer');
const initializeSchedule = require('./scheduler');

function initializePlayerData(req) {
  const playerID = req?.playerID;

  if (!playerID) {
    console.error('PlayerID not found in req:', req);
    throw new Error('PlayerID is required to initialize player data.');
  }

  console.log(`Initializing player data for playerID: ${playerID}...`);
  initializeBank(req);
  initializeTeams(req);
  initializeSchedule(req);
  console.log(`Player data initialized for playerID: ${playerID}.`);
}

module.exports = initializePlayerData;
