const fs = require('fs');
const path = require('path');

function getFilePath(filePath, playerID) {
  if (playerID) {
    const playerIDFilePath = `player_${playerID}_${filePath}`;
    const playerIDPath = path.join(__dirname, '../data/', playerIDFilePath);

    console.log(`To Path: ${playerIDPath}`);
    return playerIDPath;
  }
  const defaultPath = path.join(__dirname, '../data/', filePath);
  console.log(`To Path: ${defaultPath}`);
  return defaultPath;
}

function loadJsonData(filePath, req) {
  const playerID = req?.playerID;
  const fullPath = getFilePath(filePath, playerID);

  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  } catch (error) {
    console.error(`Error loading JSON from ${fullPath}:`, error);
    return [];
  }
}

function saveJsonData(filePath, data, req) {
  const playerID = req?.playerID;
  const fullPath = getFilePath(filePath, playerID);

  try {
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Successfully saved JSON to ${fullPath}`);
  } catch (error) {
    console.error(`Error saving JSON to ${fullPath}:`, error);
  }
}

function loadJsonDataFromPath(filePath) {
  const fullPath = path.join(__dirname, filePath);
  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  } catch (error) {
    console.error(`Error loading JSON from ${filePath}:`, error);
    return [];
  }
}

function saveJsonDataToPath(filePath, data) {
  const fullPath = path.join(__dirname, filePath);
  try {
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Successfully saved JSON to ${filePath}`);
  } catch (error) {
    console.error(`Error saving JSON to ${filePath}:`, error);
  }
}

module.exports = {
  loadJsonData,
  saveJsonData,
  loadJsonDataFromPath,
  saveJsonDataToPath,
};
