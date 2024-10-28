import './styles.css';
import GameManagerParent from './components/GameManagerParent';
import TeamList from './components/TeamList';

function App() {
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
