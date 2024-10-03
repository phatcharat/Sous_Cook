import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MenuDetail from './components/MenuDetail';
import PreferencesPage from './components/PreferencesPage';
import MenuSuggestion from './components/MenuSuggestion';
import React, { useState } from 'react';
import './css/App.css';
import Navbar from './components/Navbar';
import Camera from './components/Camera';
function App() {
  const [showCamera, setShowCamera] = useState(false);

  return (
    <div className="App">
      {showCamera ? (
        <Camera onClose={() => setShowCamera(false)} />
      ) : (
        <Navbar onCameraClick={() => setShowCamera(true)} />
      )}
      <Routes>
        <Route path="/" element={<MenuSuggestion />} />
        <Route path="/menu-detail/:index" element={<MenuDetail />} />
        <Route path="/menu-detail" element={<MenuDetail />} />
        <Route path="/preferences" element={<PreferencesPage />} />
      </Routes>
    </div>
  );
}

export default App;
