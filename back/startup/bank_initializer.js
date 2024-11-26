const fs = require('fs');
const path = require('path');

const bankFilePath = path.join(__dirname, '../data/bank.json');

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

function initializeBank() {
  try {
    fs.writeFileSync(bankFilePath, JSON.stringify(defaultBankData, null, 2), 'utf8');
    console.log('Bank file has been initialized successfully.');
  } catch (error) {
    console.error('Error initializing bank file:', error);
  }
}

module.exports = initializeBank;
