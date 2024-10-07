import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MenuDetail from './components/MenuDetail';
import PreferencesPage from './components/PreferencesPage';
import MenuSuggestion from './components/MenuSuggestion';
import IngredientPreview from './components/IngredientPreview'; 
import HomePage from './components/HomePage'; 
import { useLocation } from 'react-router-dom';
import React, { useState } from 'react';
import './css/App.css';
import Navbar from './components/Navbar';
import Camera from './components/Camera';
function App() {
  const location = useLocation();  // Get the current location
  const route_list = ["/", "/home", "/favorites", "/history", "/account"]; 
  return (
    <div className="App">
      {route_list.includes(location.pathname) ? (
        <Navbar />
      ) : (
        <></>
      )}

      <Routes>
      <Route path="" element={<HomePage />}  />
        <Route path="/" element={<HomePage />}  />
        <Route path="/home" element={<HomePage />}  />
        <Route path="/menu-suggestion" element={<MenuSuggestion />} />
        <Route path="/camera" element={<Camera />} />
        <Route path="/menu-detail/:index" element={<MenuDetail />} />
        <Route path="/menu-detail" element={<MenuDetail />} />
        <Route path="/preferences" element={<PreferencesPage />} />
        <Route path="/ingredients-preview" element={<IngredientPreview />} />
      </Routes>
    </div>
  );
}

export default App;
