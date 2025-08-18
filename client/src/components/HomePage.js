import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import '../css/HomePage.css';  // Import the CSS file
import header from '../image/homepage/Header.svg';
import listicon from '../image/homepage/List.svg';
import searchicon from '../image/homepage/Search-Icon.svg'
import bread from '../image/homepage/Bread.svg';
import tomato from '../image/homepage/Tomato.svg';
import celery from '../image/homepage/Celery.svg';
import pork from '../image/homepage/Pork.svg';
import breadclick from '../image/homepage/BreadClick.svg';
import tomatoclick from '../image/homepage/TomatoClick.svg';
import celeryclick from '../image/homepage/CeleryClick.svg';
import porkclick from '../image/homepage/PorkClick.svg';

const HomePage = () => {
  const navigate = useNavigate();
  const [activeImages, setActiveImages] = useState([bread, tomato, celery, pork]);

  const toggleImage = (index) => {
    const newImages = [...activeImages];
    switch (index) {
      case 0:
        newImages[0] = newImages[0] === bread ? breadclick : bread;
        break;
      case 1:
        newImages[1] = newImages[1] === tomato ? tomatoclick : tomato;
        break;
      case 2:
        newImages[2] = newImages[2] === celery ? celeryclick : celery;
        break;
      case 3:
        newImages[3] = newImages[3] === pork ? porkclick : pork;
        break;
      default:
        break;
    }
    setActiveImages(newImages);
  };

  return (
    <div className="homepage-container">
      <img src={header} alt="Header" className="header-image" />
      <div className="second-container">
        <p className="greet-user">HELLO <span className="username">USER!</span></p>
        <img src={listicon} alt="List" className="list-icon" />
      </div>
      <p className="question-text">What's on yout mind today chef?</p>
      <div className="search-box" onClick={() => navigate("/search")}>
        <img src={searchicon} alt="search" className="search-icon" />
        <p className="search-text">Search your ingredients here</p>
      </div>
      <div className="most-searched">
        <p className="most-searched-text">Most Searched Ingredients</p>
        <div className="ingredients-scroll">
          {activeImages.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Ingredient ${idx}`}
              onClick={() => toggleImage(idx)}
              style={{ cursor: "pointer" }}
            />
          ))}
        </div>
      </div>
    </div>
  );

};

export default HomePage;
