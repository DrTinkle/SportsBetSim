![Main screenshot](./screenshots/screenshot1.jpg)


# SportsBetSim - A Betting Game Simulator (Work in Progress)

SportsBetSim is a **betting game simulator** that generates random sports teams, calculates match results, and allows users to place simulated bets on upcoming games. This project is currently in development, and features are still being added and refined.

## Features

### Core Functionality
- **Random Team Generation**: Generates unique stats for 20 teams across three sports.
- **Matchup Scheduling**: Creates schedules for upcoming and past matchups. Past matchups are calculated based on weighted randomization with team stat comparisons.
- **Team Profiles**: Lists of teams for each sport, including a "team profile" view that displays a team’s match history and statistics.
- **Odds Calculation**: Calculates odds for each upcoming matchup based on match history and team stats.
- **Daily Match Processing**: Upon moving to the "Next Day," match results are calculated, matches are archived to history, and team stats are updated. Odds are recalculated for future matchups.

### Betting System (In Progress)
- **Betting Grid and Odds Calculation**: Allows users to view upcoming matches and select odds for betting. 
- **Bet Ticket System**: Tracks submitted bet tickets and calculates potential winnings. A Ticket Manager tracks all finalized tickets.

## Dependencies
- **Node.js**
- **Express**
- **React**
- **react-router-dom**

> ⚠️ **Note**: This project is a work in progress, and more updates are to come. The current structure and functionality are subject to change.
