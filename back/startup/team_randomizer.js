const { loadJsonData, saveJsonData, loadJsonDataFromPath } = require('../utils/json_helpers');
const teamsFilePath = 'teams.json';
const teamNamesFilePath = '../startup/startup_data/team_names.json';

let teamsData;

function initializeTeams(req = null) {
  const existingTeamsData = loadJsonData(teamsFilePath, req);

  if (!existingTeamsData.length) {
    console.log('teams.json not found. Generating from team_names.json...');

    const teamNamesData = loadJsonDataFromPath(teamNamesFilePath);
    if (!teamNamesData) {
      process.exit(1);
    }

    teamsData = teamNamesData.map((sport) => ({
      sport: sport.sport,
      teams: sport.teams.map((teamName) => ({
        name: teamName,
        speed: 0,
        agility: 0,
        attack: 0,
        defense: 0,
        overall: 0,
        randomized: false,
      })),
    }));

    saveJsonData(teamsFilePath, teamsData, req);
    console.log('teams.json has been generated.');
  } else {
    teamsData = loadJsonData(teamsFilePath, req);
    if (!teamsData) {
      process.exit(1);
    }
  }

  teamsData.forEach((sport) => {
    sport.teams.forEach((team) => {
      randomizeStats(team);
    });
  });

  saveJsonData(teamsFilePath, teamsData, req);
  console.log('Teams stats have been randomized and updated.');
}

function randomizeStats(team) {
  if (!team.randomized) {
    team.speed = Math.floor(Math.random() * 100) + 1;
    team.agility = Math.floor(Math.random() * 100) + 1;
    team.attack = Math.floor(Math.random() * 100) + 1;
    team.defense = Math.floor(Math.random() * 100) + 1;
    team.overall = Math.round((team.speed + team.agility + team.attack + team.defense) / 4);
    team.randomized = true;
  }
}

module.exports = initializeTeams;
