const fs = require('fs');
const path = require('path');

const getNextMatchups = (sport) => {
  const schedulePath = path.join(__dirname, '../data/schedule.json');
  const scheduleData = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));

  if (!scheduleData[sport]) {
    return [];
  }

  const matchups = scheduleData[sport].matchups.sort((a, b) => a.order - b.order).slice(0, 3);

  return matchups;
};

module.exports = { getNextMatchups };
