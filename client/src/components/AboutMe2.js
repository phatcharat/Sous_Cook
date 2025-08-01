import React from 'react';
import '../css/AboutMe2.css';  // Import the CSS file
import picAboutMe2 from '../image/picAboutMe2.jpg';
const AboutMe2 = () => {
    return (
      <div className="home-container">
        <div className="logo-container">
          <img src={picAboutMe2} alt="Picture AboutMe2" className="image" />
          <h1>our mission</h1>
          <p className="description">
            "Provide a proper cooking and food preparation techniques to significantly 
minimize food waste."
          </p>

          {/* จุดบอกหน้าปัจจุบัน */}
          <div className="indicator">
            <span className="dot"></span>
            <span className="dot active"></span>
            <span className="dot"></span>
          </div>

          <button className="get-started-button">GET STARTED</button>
        </div>
      </div>
    );
  };
  
  export default AboutMe2;