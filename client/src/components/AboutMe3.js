import React from "react";
import '../css/AboutMe3.css';
import picAboutMe3 from '../image/picAboutMe3.svg';
import { useNavigate } from 'react-router-dom';

const AboutMe3 = () => {
    const navigate = useNavigate();
    return (
      <div className="home-container">
        <div className="logo-container">
          <img src={picAboutMe3} alt="Picture AboutMe3" className="image" />
          <h1>Join Us Now!</h1>
          <p className="description">
            "Cutting down on food waste not only positively impacts the world but also puts money back in your pocket by eliminating unnecessary spending."

Let’s be a part of eco-conscious together !
          </p>

          {/* จุดบอกหน้าปัจจุบัน */}
          <div className="indicator">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot active"></span>
          </div>

          <button className="get-started-button" onClick={() => navigate("/login")}>
            GET STARTED
          </button>
        </div>
      </div>
    );
  };

export default AboutMe3;