import React from 'react';
import '../css/AboutMe1.css';  // Import the CSS file
import logo from '../image/Logo.svg';
import { useNavigate } from 'react-router-dom';

const AboutMe1 = () => {
    const navigate = useNavigate();
    return (
      <div className="home-container">
        <div className="logo-container">
          <img src={logo} alt="Sous Cook Logo" className="logo-image" />
          <p className="description">
            Sous cook is your little cooking helper, he will suggest whip-up delicious recipes based on your ingredients!
          </p>

          {/* จุดบอกหน้าปัจจุบัน */}
          <div className="indicator">
            <span className="dot active"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>

          <button className="get-started-button" onClick={() => navigate("/home")}>
            GET STARTED
          </button>
        </div>
      </div>
    );
  };
  
  export default AboutMe1;