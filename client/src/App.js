import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MenuDetail from './components/MenuDetail';
import PreferencesPage from './components/PreferencesPage';
import MenuSuggestion from './components/MenuSuggestion';
import IngredientPreview from './components/IngredientPreview'; 
import HomePage from './components/HomePage'; 
import AboutMe1 from './components/AboutMe1';
import AboutMe2 from './components/AboutMe2';
import { useLocation } from 'react-router-dom';
import React, { useState } from 'react';
import './css/App.css';
import Navbar from './components/Navbar';
import Camera from './components/Camera';
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPassword'; 

function App() {
  const location = useLocation();  // Get the current location
  const route_list = ["/home", "/favorites", "/history", "/account"]; 
  return (
    <div className="App">
      {route_list.includes(location.pathname) ? (
        <Navbar />
      ) : (
        <></>
      )}

      <Routes>
      <Route path="" element={<AboutMe1 />}  />
        <Route path="/" element={<AboutMe1 />}  />
        <Route path="/AboutMe1" element={<AboutMe1 />}  />
        <Route path="/AboutMe2" element={<AboutMe2 />}  />
        <Route path="/home" element={<HomePage />}  />
        <Route path="/menu-suggestion" element={<MenuSuggestion />} />
        <Route path="/camera" element={<Camera />} />
        <Route path="/menu-detail/:index" element={<MenuDetail />} />
        <Route path="/menu-detail" element={<MenuDetail />} />
        <Route path="/preferences" element={<PreferencesPage />} />
        <Route path="/ingredients-preview" element={<IngredientPreview />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </div>
  );
}

export default App;
