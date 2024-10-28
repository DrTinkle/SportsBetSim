import React, { useState, useEffect } from 'react';

const TeamList = () => {
  const [teamNames, setTeamNames] = useState([]);
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [loading, setLoading] = useState(true);
  const [matchHistory, setMatchHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    const fetchTeamNames = async () => {
      try {
        const response = await fetch('/api/teamNames');
        const data = await response.json();
        setTeamNames(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching team names:', error);
        setLoading(false);
      }
    };

    fetchTeamNames();
  }, []);

  const handleSportChange = (e) => {
    setSelectedSport(e.target.value);
    setSelectedTeam('');
    setMatchHistory([]);
    setShowModal(false);
  };

  const handleTeamClick = async (team) => {
    setSelectedTeam(team);
    setShowModal(true);

    try {
      const response = await fetch(`/api/team-match-history/${team}`);
      const data = await response.json();
      setMatchHistory(data);
    } catch (error) {
      console.error('Error fetching match history:', error);
      setMatchHistory([]);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFilterText('');
  };

  const filteredMatches = matchHistory.filter(
    (match) =>
      match.teamA.toLowerCase().includes(filterText.toLowerCase()) ||
      match.teamB.toLowerCase().includes(filterText.toLowerCase())
  );

  if (loading) {
    return <div>Loading teams...</div>;
  }

  let selectedSportData = teamNames.find((sport) => sport.sport === selectedSport);
  if (selectedSportData) {
    selectedSportData.teams.sort((a, b) => a.localeCompare(b));
  }

  return (
    <div className="team-selector-container">
      <div className="sport-selector">
        <label htmlFor="sport">Select Sport: </label>
        <select id="sport" value={selectedSport} onChange={handleSportChange}>
          <option value="">--Select a Sport--</option>
          {teamNames.map((sport) => (
            <option key={sport.sport} value={sport.sport}>
              {sport.sport.charAt(0).toUpperCase() + sport.sport.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {selectedSportData && (
        <div className="team-grid">
          {selectedSportData.teams.map((team) => {
            const teamImageName = team.toLowerCase().replace(/\s+/g, '_');
            const teamImagePath = `/images/${teamImageName}.jpg`;

            return (
              <div key={team} className="team-card" onClick={() => handleTeamClick(team)}>
                <img src={teamImagePath} alt={team} className="team-image" loading="lazy" />
                <h3>{team}</h3>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <h3>Match History for {selectedTeam}</h3>

            <input
              type="text"
              placeholder="Filter by team name..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="filter-input"
            />

            <ul>
              {filteredMatches.length > 0 ? (
                filteredMatches.map((match, index) => (
                  <li key={index} className="team-history-item">
                    {match.winner === match.teamA ? (
                      <strong className="team-history-match-winner">
                        {match.teamA} {match.scoreTeamA}
                      </strong>
                    ) : (
                      <span>
                        {match.teamA} {match.scoreTeamA}
                      </span>
                    )}{' '}
                    -{' '}
                    {match.winner === match.teamB ? (
                      <strong className="team-history-match-winner">
                        {match.scoreTeamB} {match.teamB}
                      </strong>
                    ) : (
                      <span>
                        {match.scoreTeamB} {match.teamB}
                      </span>
                    )}
                  </li>
                ))
              ) : (
                <li>No matches found for "{filterText}".</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamList;
