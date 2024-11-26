import React, { useEffect } from 'react';
import './fetchInterceptor';
import './styles.css';
import GameManagerParent from './components/GameManagerParent';
import TeamList from './components/TeamList';

function App() {
  useEffect(() => {
    async function initializePlayerData() {
      try {
        const response = await fetch('/api/initialize-player', {
          method: 'POST',
          credentials: 'include', // Include cookies
        });

        if (response.ok) {
          const result = await response.json();
          console.log(result.message);
        } else {
          console.error('Failed to initialize player data:', response.statusText);
        }
      } catch (error) {
        console.error('Error initializing player data:', error);
      }
    }

    initializePlayerData();
  }, []);
  return (
    <div className="App">
      <header className="App-header"></header>
      <div className="main-logo">
        <img
          src={`${process.env.PUBLIC_URL}/images/title_logo.png`}
          alt="Main Logo"
          width="25%"
          height="25%"
        />
      </div>

      <div>
        <GameManagerParent></GameManagerParent>
      </div>

      <div className="team-list">
        <h1 className="team-stats-header">Team Stats</h1>
        <TeamList></TeamList>
      </div>
    </div>
  );
}

export default App;
