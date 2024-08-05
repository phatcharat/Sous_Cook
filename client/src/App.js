import React from 'react';
import './css/App.css';
import Camera from './components/Camera';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to My React App</h1>
        <Navbar />
        <Camera />
      </header>
    </div>
  );
}

export default App;
