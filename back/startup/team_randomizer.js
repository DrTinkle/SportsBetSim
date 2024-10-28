const fs = require('fs');
const path = require('path');

const teamsFilePath = path.join(__dirname, '../data/teams.json');
const teamNamesFilePath = path.join(__dirname, '../data/team_names.json');

let teamsData;

if (!fs.existsSync(teamsFilePath)) {
  console.log('teams.json not found. Generating from team_names.json...');

  let teamNamesData;
  try {
    teamNamesData = JSON.parse(fs.readFileSync(teamNamesFilePath, 'utf8'));
  } catch (error) {
    console.error('Error reading team names data:', error);
    process.exit(1);
  }

  teamsData = teamNamesData.map((sport) => {
    return {
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
    };
  });

  try {
    fs.writeFileSync(teamsFilePath, JSON.stringify(teamsData, null, 2));
    console.log('teams.json has been generated.');
  } catch (error) {
    console.error('Error writing teams.json:', error);
    process.exit(1);
  }
} else {
  try {
    teamsData = JSON.parse(fs.readFileSync(teamsFilePath, 'utf8'));
  } catch (error) {
    console.error('Error reading teams data:', error);
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

teamsData.forEach((sport) => {
  sport.teams.forEach((team) => {
    randomizeStats(team);
  });
});

try {
  fs.writeFileSync(teamsFilePath, JSON.stringify(teamsData, null, 2));
  console.log('Teams stats have been randomized and updated.');
} catch (error) {
  console.error('Error writing teams data:', error);
}
