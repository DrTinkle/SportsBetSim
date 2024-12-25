<div align="center">
  <img src="./public/images/title_logo.png" alt="Title Logo" width="300" />
</div>

# SportsBetSim - Sports Betting Simulator (Work in Progress)

SportsBetSim is a browser-based **sports betting simulator game** built with **React**. Currently it generates random sports teams, calculates match results, and allows users to place bets on upcoming games. This project is currently in development, and features are still being added and refined. [Give the prototype a try here](https://sportsbetsim-front.onrender.com/) 

*Note: The project is hosted on Render, and the server winds down after periods of inactivity. As a result, it may take a few seconds to start up when accessed. If you notice any missing upcoming matchups, please wait a moment and refresh the page until all data loads properly.*

## Features

### Core Functionality
- **Random Team Generation**: Generates unique stats for 20 teams across three sports.
- **Matchup Scheduling**: Creates schedules for upcoming and past matchups. Past matchups are calculated based on weighted randomization with team stat comparisons.
- **Team Profiles**: Lists of teams for each sport, including a "team profile" view that displays a team’s match history and statistics.
- **Odds Calculation**: Calculates odds for each upcoming matchup based on match history and team stats.
- **Daily Match Processing**: Upon moving to the "Next Day", match results are calculated and weighted with team stats, matches are archived to history, and team stats are updated. Odds are recalculated for future matchups.
- **Persistent Player Data**: Each player's game state, including teams, match history, and bank status, is stored separately using a unique `playerID` retrieved from cookies. This ensures isolated data files and independent gameplay for each player.

### Betting System
- **Betting Grid and Odds Calculation**: Allows users to view upcoming matches and select odds for betting. 
- **Bet Ticket System**: Tracks submitted bet tickets and calculates potential winnings. A Ticket Manager tracks all finalized tickets.

### Story and Loan/Rent System (In progress)
- **The Backstory**: Start with overdue rent and a $2,000 mafia loan, navigating a high-stakes world of sports betting to survive.  
- **Loan System**: Manage weekly loan repayments with increasing interest or risk losing it all.  
- **Rent System**: Pay weekly rent to avoid eviction, creating constant pressure to win bets.

## Technologies Used

### Frontend
- **React**: For building the user interface.
- **react-router-dom**: For routing and navigation.

### Backend
- **Node.js**: Handles server-side logic.
- **Express**: Powers the RESTful API.

### Deployment
- **Dockerized Setup**: SportsBetSim uses **Docker** for deployment, with two separate services:
  - **Frontend Service**: Serves the React application using Nginx.
  - **Backend Service**: Runs the Node.js/Express server with CORS enabled for frontend-backend communication.
- **Reverse Proxy (Nginx)**: Initially intended to handle API routing from the frontend to the backend. However, challenges with Nginx on Render led to a different approach (explained below).

### Hosting
- **Render**: SportsBetSim is hosted on Render, with two separate services for the frontend and backend:
  - The **frontend service** is configured to serve the React app.
  - The **backend service** is configured to run the Express API.

#### Challenges on Render:
- Render's Nginx configuration did not successfully proxy API calls from the frontend to the backend, resulting in 502 errors.
- To resolve this issue, I **hardcoded the backend URL** (`https://sportsbetsim-back.onrender.com`) for API calls in the frontend and used CORS in the backend to allow cross-origin requests.

This temporary fix bypassed the need for Nginx proxying and ensured working communication between the frontend and backend.

## Coming Soon
The next updates will focus on **completing the loan and rent system** with tracking and win/lose conditions.


> ⚠️ **Note**: This project is a work in progress, and more updates are to come. The current structure and functionality are subject to change.
