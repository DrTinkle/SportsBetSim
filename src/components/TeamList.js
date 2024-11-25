import React, { useState, useEffect } from 'react';

const TeamList = () => {
  const [teamNames, setTeamNames] = useState([]);
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [loading, setLoading] = useState(true);
  const [matchHistory, setMatchHistory] = useState([]);
  const [teamStats, setTeamStats] = useState(null);
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
    setTeamStats(null);
    setShowModal(false);
  };

  const handleTeamClick = async (team) => {
    setSelectedTeam(team);
    setShowModal(true);

    try {
      const response = await fetch(`/api/team-match-history/${team}`);
      const data = await response.json();
      setMatchHistory(data.matches || []);
      setTeamStats(data.stats || null);
    } catch (error) {
      console.error('Error fetching match history:', error);
      setMatchHistory([]);
      setTeamStats(null);
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
            <h3 className="team-modal-header">Match History for {selectedTeam}</h3>

            <div className="team-history-grid">
              {teamStats && (
                <div className="team-stats-container">
                  {selectedTeam && (
                    <img
                      src={`/images/${selectedTeam.toLowerCase().replace(/\s+/g, '_')}.jpg`}
                      alt={selectedTeam}
                      className="team-modal-image"
                      loading="lazy"
                    />
                  )}
                  <div className="team-stats-grid">
                    <div className="team-stats-labels">
                      <p>
                        <strong>Wins:</strong>
                      </p>
                      <p>
                        <strong>Losses:</strong>
                      </p>
                      <p>
                        <strong>Ties:</strong>
                      </p>
                      <p>
                        <strong>Points Per Match:</strong>
                      </p>
                    </div>
                    <div className="team-stats-values">
                      <p>{teamStats.wins}</p>
                      <p>{teamStats.losses}</p>
                      <p>{teamStats.ties}</p>
                      <p>{teamStats.pointsPerMatch}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="team-match-history">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamList;
