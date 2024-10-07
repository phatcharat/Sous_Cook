import React from 'react';
import '../css/HomePage.css';  // Import the CSS file
import logo from '../image/Logo.svg';
const HomePage = () => {
    return (
      <div className="home-container">
        <div className="logo-container">
          <img src={logo} alt="Sous Cook Logo" className="logo-image" />
          <p className="description">
            Sous cook is your little cooking helper, he will suggest whip-up delicious recipes based on your ingredients!
          </p>
        </div>
      </div>
    );
  };
  
  export default HomePage;
