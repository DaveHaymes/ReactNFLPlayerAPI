import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import NFLTeamsTable from './components/NFLTeamsTable'; // Ensure the path is correct

function App() {
  return (
    <div className="App">
      <NFLTeamsTable />
    </div>
  );
}

export default App;
