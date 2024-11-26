const express = require('express');
const initializePlayerData = require('../startup/initialize_player_data');
const router = express.Router();

router.post('/initialize-player', (req, res) => {
  try {
    initializePlayerData(req);
    res.status(200).send({ message: `Player data initialized for ${req.playerID}.` });
  } catch (error) {
    console.error('Error initializing player data:', error);
    res.status(500).send({ error: 'Failed to initialize player data.', details: error.message });
  }
});

module.exports = router;
