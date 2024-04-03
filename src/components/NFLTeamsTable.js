import React, { useEffect, useState } from 'react';

// Component for displaying NFL Teams and their players
const NFLTeamsTable = () => {
  // State for storing the list of teams
  const [teams, setTeams] = useState([]);
  // State to control the visibility of the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State to hold the selected team for which player details will be fetched
  const [selectedTeam, setSelectedTeam] = useState(null);
  // State for storing the list of players of the selected team
  const [players, setPlayers] = useState([]);
  // State to indicate whether the player details are being fetched
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  // State to store and display any error messages
  const [error, setError] = useState('');

  // useEffect hook to fetch the list of NFL teams once the component mounts
  useEffect(() => {
    // Asynchronous function to fetch team data
    const fetchTeams = async () => {
      try {
        const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams');
        if (!response.ok) {
          throw new Error('Failed to fetch teams');
        }
        const { sports } = await response.json();
        const teamsData = sports[0].leagues[0].teams.map(({ team }) => team);
        setTeams(teamsData);
      } catch (error) {
        console.error('Failed to fetch teams:', error);
        setError(error.message);
      }
    };

    // Calling fetchTeams to initiate the data fetch
    fetchTeams();
  }, []);

  // Function to fetch player details for a selected team
  const fetchPlayers = async (teamId) => {
    setIsLoadingPlayers(true);
    try {
      const response = await fetch(`https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2024/teams/${teamId}/athletes?limit=50`);
      if (!response.ok) {
        throw new Error('Failed to fetch players');
      }
      const data = await response.json();
      const playerDetailsPromises = data.items.map(item =>
        fetch(item.$ref).then(response => response.json())
      );
      const playersData = await Promise.all(playerDetailsPromises);
      setPlayers(playersData);
    } catch (error) {
      console.error('Failed to fetch players:', error);
      setError(error.message);
    } finally {
      setIsLoadingPlayers(false);
    }
  };

  // Event handler for when a user clicks on a team
  // Sets the selected team and initiates player data fetch
  const handleTeamClick = (team) => {
    setSelectedTeam(team);
    fetchPlayers(team.id);
    setIsModalOpen(true);
  };

  // Function to close the modal and reset player data
  const closeModal = () => {
    setIsModalOpen(false);
    setPlayers([]); // Clears the player data
    setError(''); // Clears any error messages
  };

  // Render method that outputs the component UI
  return (
    <div className="container mt-5">
      {/* Conditionally rendering error messages if present */}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {/* Modal for displaying players of the selected team */}
      <div className={`modal fade ${isModalOpen ? 'show' : ''}`} style={{ display: isModalOpen ? 'block' : 'none' }} tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content text-dark">
            <div className="modal-header">
              <h5 className="modal-title">Team Details</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
            </div>
            {/* Body of the modal which either shows a loading spinner or player details */}
            <div className="modal-body" style={{ maxHeight: 'calc(100vh - 210px)', overflowY: 'auto' }}>
              <table className="table">
              <tbody>
                {isLoadingPlayers ? (

                    <tr>
                      <td colSpan="2" className="text-center">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading Players...</span>
                        </div>
                        <div>Loading Players...</div>
                      </td>
                    </tr>
                ) : (
                  players.map(player => (
                    <tr key={player.id}>
                      <td className="text-center align-middle"><img src={player.headshot.href} alt={player.fullName} style={{ width: '150px', border: '1px solid #333' }} /></td>
                      <td className="text-center align-middle">#{player.jersey} {player.fullName} ({player.position.abbreviation})</td>
                    </tr>
                  ))
                )}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      </div>

      {/* Table displaying the list of NFL teams */}
      <div className="row justify-content-center">
        <div className="col-md-8 bg-dark text-white">
          <h2>NFL Teams</h2>
          <table className="table table-dark table-striped table-hover">
            <thead>
              <tr>
                <th scope="col" className="text-center align-middle">Logo</th>
                <th scope="col" className="text-center align-middle">Team Name</th>
                <th scope="col" className="text-center align-middle">Location</th>
                <th scope="col" className="text-center align-middle">Abbreviation</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id} onClick={() => handleTeamClick(team)} style={{ cursor: 'pointer' }}>
                  <td className="text-center align-middle">
                    <img src={team.logos[0].href} alt={team.shortDisplayName} style={{ width: '50px', height: '50px' }} />
                  </td>
                  <td className="text-center align-middle" style={{ textDecoration: 'underline' }}>{team.displayName}</td>
                  <td className="text-center align-middle">{team.location}</td>
                  <td className="text-center align-middle">{team.abbreviation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NFLTeamsTable;
