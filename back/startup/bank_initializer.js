const { saveJsonData } = require('../utils/json_helpers');

const defaultBankData = {
  balance: 2000,
  loans: [
    {
      amount: 2000,
      interestRate: 10,
      daysRemaining: 30,
    },
  ],
  rentDue: 500,
  daysRemaining: 7,
};

function initializeBank(req) {
  try {
    saveJsonData('bank.json', defaultBankData, req);
    console.log('Bank file has been initialized successfully.');
  } catch (error) {
    console.error('Error initializing bank file:', error);
  }
}

module.exports = initializeBank;
