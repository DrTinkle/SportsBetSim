const { loadJsonData } = require('./json_helpers');

const getNextMatchups = (sport, req) => {
  const scheduleData = loadJsonData('schedule.json', req);

  if (!scheduleData[sport]) {
    return [];
  }

  const matchups = scheduleData[sport].matchups.sort((a, b) => a.order - b.order).slice(0, 3);

  return matchups;
};

module.exports = { getNextMatchups };
