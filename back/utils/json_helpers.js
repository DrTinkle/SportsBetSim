const fs = require('fs');
const path = require('path');

function loadJsonData(filePath) {
  const fullPath = path.join(__dirname, '../data/', filePath);
  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  } catch (error) {
    console.error(`Error loading JSON from ${filePath}:`, error);
    return [];
  }
}

function saveJsonData(filePath, data) {
  const fullPath = path.join(__dirname, '../data/', filePath);
  try {
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Successfully saved JSON to ${filePath}`);
  } catch (error) {
    console.error(`Error saving JSON to ${filePath}:`, error);
  }
}

module.exports = { loadJsonData, saveJsonData };
