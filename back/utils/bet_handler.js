const { loadJsonData, saveJsonData } = require('./json_helpers');

function generateCombinations(betsPerMatch) {
  const result = [];
  const recurse = (currentCombination, index) => {
    if (index === betsPerMatch.length) {
      result.push(
        currentCombination.map((bet) => ({
          label: bet.label,
          outcome: bet.outcome,
          matchId: bet.matchId,
          odds: bet.odds,
        }))
      );
      return;
    }

    for (const bet of betsPerMatch[index]) {
      recurse([...currentCombination, bet], index + 1);
    }
  };

  recurse([], 0);
  return result;
}

function processBets(req) {
  const ticketsFilePath = 'tickets.json';
  const matchHistoryFilePath = 'match_history.json';
  const bankFilePath = 'bank.json';

  const tickets = loadJsonData(ticketsFilePath, req);
  const matchHistory = loadJsonData(matchHistoryFilePath, req);
  const bankData = loadJsonData(bankFilePath, req);

  tickets.forEach((ticket) => {
    if (ticket.ticketProcessed) {
      return;
    }

    if (!ticket.combinationsProcessed) {
      const betsPerMatch = Object.values(ticket.betLines);
      ticket.combinations = generateCombinations(betsPerMatch);
      ticket.combinationsProcessed = true;
    }

    let allMatchesProcessed = true;

    Object.keys(ticket.betLines).forEach((label) => {
      const bets = ticket.betLines[label];

      bets.forEach((bet) => {
        if (bet.isProcessed) return;

        const match = Object.values(matchHistory)
          .flatMap((sport) => sport.matchups)
          .find((m) => m.matchId === bet.matchId);

        if (!match) {
          allMatchesProcessed = false;
          return;
        }

        const actualOutcome =
          match.winner === match.teamA ? '1' : match.winner === match.teamB ? '2' : 'X';

        bet.isProcessed = true;

        ticket.results[label] = ticket.results[label] || [];
        const existingResult = ticket.results[label].some((r) => r.matchId === bet.matchId);
        if (!existingResult) {
          ticket.results[label].push({
            matchId: bet.matchId,
            outcome: actualOutcome,
            odds: bet.odds,
          });
        }
      });
    });

    if (!allMatchesProcessed) {
      return;
    }

    let totalWinnings = 0;

    ticket.combinations.forEach((combination) => {
      const lineSuccessful = combination.every((bet) =>
        ticket.results[bet.label].some(
          (result) => result.matchId === bet.matchId && result.outcome === bet.outcome
        )
      );

      if (lineSuccessful) {
        const cumulativeOdds = combination.reduce((acc, bet) => acc * parseFloat(bet.odds), 1);
        totalWinnings += ticket.betAmount * cumulativeOdds;
      }
    });

    ticket.totalWinnings = totalWinnings > 0 ? totalWinnings.toFixed(2) : '0.00';
    ticket.ticketProcessed = true;

    if (totalWinnings > 0) {
      bankData.balance += totalWinnings;
    }
  });

  saveJsonData(ticketsFilePath, tickets, req);
  saveJsonData(bankFilePath, bankData, req);
  console.log('Bet processing complete.');
}

module.exports = { processBets };
