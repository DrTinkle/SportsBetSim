const fs = require('fs');

const { loadJsonData, saveJsonData } = require('../utils/json_helpers');
const teamsFilePath = '../data/teams.json';
const teamNamesFilePath = '../data/team_names.json';

let teamsData;

if (!fs.existsSync(teamsFilePath)) {
  console.log('teams.json not found. Generating from team_names.json...');

  const teamNamesData = loadJsonData(teamNamesFilePath);
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

  saveJsonData(teamsFilePath, teamsData);
  console.log('teams.json has been generated.');
} else {
  teamsData = loadJsonData(teamsFilePath);
  if (!teamsData) {
    process.exit(1);
  }
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

function initializeTeams() {
  teamsData.forEach((sport) => {
    sport.teams.forEach((team) => {
      randomizeStats(team);
    });
  });

  saveJsonData(teamsFilePath, teamsData);
  console.log('Teams stats have been randomized and updated.');
}

module.exports = initializeTeams;
