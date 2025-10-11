import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import '../css/HomePage.css';  // Import the CSS file
import { getUserId, isLoggedIn } from '../utils/auth';
import { getShoppingListFromStorage } from '../utils/storageUtils';
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
import banner1 from '../image/homepage/banner/Banner1.svg';
import banner2 from '../image/homepage/banner/Banner2.svg';
import banner3 from '../image/homepage/banner/Banner3.svg';
import banner4 from '../image/homepage/banner/Banner4.svg';
import randommenu from '../image/homepage/random-menu/Random-menu.svg';
import news from '../image/homepage/news/News.svg'


const HomePage = () => {
  const navigate = useNavigate();
  const [activeImages, setActiveImages] = useState([bread, tomato, celery, pork]);
  const [username, setUsername] = useState("USER");
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [shoppingListCount, setShoppingListCount] = useState(0);

  const logSafeUserEvent = (event, details = {}) => {
    // Create safe copy of details, removing sensitive data
    const safeDetails = { ...details };
    
    // mask sensitive fields
    if (safeDetails.userId) safeDetails.userId = '****';
    if (safeDetails.username) safeDetails.username = '****';
    if (safeDetails.email) safeDetails.email = '****';
    
    console.log(`Event: ${event}`, safeDetails);
  };

  // Update useEffect with safe logging
  useEffect(() => {
    const userId = getUserId();
    const loggedIn = isLoggedIn();
    setIsUserLoggedIn(loggedIn);

    const fetchUserData = async () => {
      try {
        if (!userId) {
          logSafeUserEvent('auth_check', { status: 'not_authenticated' });
          setUsername("USER");
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/users/${userId}`);
        const user = response.data.user;
        
        logSafeUserEvent('user_data_fetch', { 
          status: 'success',
          hasData: !!user
        });

        if (user && user.username) {
          setUsername(user.username.toUpperCase() + "!");
        }
      } catch (error) {
        logSafeUserEvent('user_data_fetch', { 
          status: 'error',
          errorType: error.response?.status === 401 ? 'unauthorized' : 'fetch_failed'
        });
        
        if (error.response?.status === 401 || error.response?.status === 403) {
          logSafeUserEvent('guest_access');
        }
      }
    };
    fetchUserData();
  }, []);

  // Add useEffect to load shopping list count
  useEffect(() => {
    const loadShoppingList = () => {
      const list = getShoppingListFromStorage();
      setShoppingListCount(list.length);
    };

    loadShoppingList();
    window.addEventListener('storage', loadShoppingList);
    
    return () => window.removeEventListener('storage', loadShoppingList);
  }, []);

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

  const chartData = [
    { month: 'Oct', value: 10.0 },
    { month: 'Nov', value: 11.0 },
    { month: 'Dec', value: 12.0 },
    { month: 'Jan', value: 12.0 }
  ]

  const chartWidth = 314
  const chartHeight = 180;
  const leftPadding = 30;
  const rightPadding = 15;
  const topPadding = 10;
  const bottomPadding = 20;

  const minValue = 9;
  const maxValue = 13;
  const valueRange = maxValue - minValue;

  const plotWidth = chartWidth - leftPadding - rightPadding;
  const plotHeight = chartHeight - topPadding - bottomPadding;
  const gridLines = 5;
  const gridSpacing = plotHeight / (gridLines - 1);

  const createPath = (data) => {
    const points = data.map((point, index) => {

      const x = leftPadding + (index * plotWidth) / (data.length - 1);

      const normalizedValue = (point.value - minValue) / valueRange;
      const y = topPadding + plotHeight - (normalizedValue * plotHeight)

      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  // Random menu
  const handleRandomMenu = async () => {
    setIsLoadingRandom(true);

    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/random-menu`);

      if (response.data.success && response.data.menu?.menu_id) {
        navigate('/menu-detail', {
          state: {
            menu: response.data.menu,
            menu_id: response.data.menu.menu_id,  // สำคัญ!
            isRandomMenu: true
          }
        });
      }
    } catch (error) {
      console.error('Error:', error);
      alert("Failed to generate menu. Please try again.");
    } finally {
      setIsLoadingRandom(false);
    }
  };

  // Update list icon click handler
  const handleListIconClick = () => {
    const shoppingList = getShoppingListFromStorage();
    navigate("/shoppinglist", { state: { missingIngredients: shoppingList } });
  };

  return (
    <div className="homepage-container">
      <img src={header} alt="Header" className="header-image" />
      <div className="second-container">

        <p className="greet-user">HELLO <span className="username">{username}</span></p>
        <div className="list-icon-container">
          <img 
            src={listicon} 
            alt="List" 
            className="list-icon" 
            onClick={handleListIconClick}
            style={{ cursor: "pointer" }} 
          />
          {shoppingListCount > 0 && (
            <span className="list-badge">{shoppingListCount}</span>
          )}
        </div>
      </div>

      <p className="question-text">What's on your mind today chef?</p>
      <div className="search-box" onClick={() => navigate("/search")}>
        <img src={searchicon} alt="search" className="search-icon" />
        <p className="search-text" >Search your ingredients here</p>
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

      <div className="food-waste-stat">
        <p className="food-waste-text">Food Waste Reduction Stat</p>
        <div className="chart-box">
          <svg className="chart-svg" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            {/* Horizontal grid lines */}
            {Array.from({ length: gridLines }).map((_, i) => {
              const y = topPadding + i * gridSpacing;
              return (
                <line
                  key={`h-${i}`}
                  x1={leftPadding}
                  y1={y}
                  x2={chartWidth - rightPadding}
                  y2={y}
                  stroke="#f0f0f0"
                  strokeWidth="1"
                />
              );
            })}

            {/* Vertical grid lines */}
            {chartData.map((_, i) => {
              const x = leftPadding + (i * plotWidth) / (chartData.length - 1);
              return (
                <line
                  key={`v-${i}`}
                  x1={x}
                  y1={topPadding}
                  x2={x}
                  y2={chartHeight - bottomPadding}
                  stroke="#f0f0f0"
                  strokeWidth="1"
                />
              );
            })}

            {/* Chart line */}
            <path
              d={createPath(chartData)}
              fill="none"
              stroke="#CCDA46"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {chartData.map((point, index) => {
              const x = leftPadding + (index * plotWidth) / (chartData.length - 1);
              const normalizedValue = (point.value - minValue) / valueRange;
              const y = topPadding + plotHeight - (normalizedValue * plotHeight);
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#B0BD39"
                  stroke="#fff"
                />
              );
            })}

            {/* Y-axis */}
            {Array.from({ length: gridLines }).map((_, i) => {
              const value = maxValue - (i * valueRange) / (gridLines - 1);
              const y = topPadding + i * gridSpacing;
              return (
                <text
                  key={`y-label-${i}`}
                  x={leftPadding - 15}
                  y={y + 5}
                  textAnchor="end"
                  className="axis-label"
                >
                  {Math.round(value)}
                </text>
              );
            })}


            {/* X-axis */}
            {chartData.map((point, index) => {
              const x = leftPadding + (index * plotWidth) / (chartData.length - 1);
              return (
                <text
                  key={index}
                  x={x}
                  y={chartHeight - bottomPadding + 20}
                  textAnchor="middle"
                  className="axis-label"
                >
                  {point.month}
                </text>
              );
            })}
          </svg>
          <div className="stat-info">
            <p className="stat-text">
              You made <span className="highlight-orange">12 dishes</span> this month
            </p>
            <p className="stat-text">
              Around <span className="highlight-orange">75 kg</span> of CO2 saved !
            </p>
          </div>
        </div>
      </div>

      <div className="banner-container">
        <div className="banner-row">
          <img src={banner1} alt="BANNER1" className="banner-scroll" />
          <img src={banner2} alt="BANNER2" className="banner-scroll" />
          <img src={banner3} alt="BANNER3" className="banner-scroll" />
          <img src={banner4} alt="BANNER4" className="banner-scroll" />
        </div>
      </div>

      <div className="random-container">
        <div className="random-box">
          <img src={randommenu} alt="RANDOM" className="random-menu" />
          <button
            className={`random-btn ${isLoadingRandom ? 'loading' : ''}`}
            style={{ cursor: isLoadingRandom ? "not-allowed" : "pointer" }}
            onClick={handleRandomMenu}
            disabled={isLoadingRandom}
          >
            {isLoadingRandom ? 'GENERATING...' : 'START RANDOM'}
          </button>
        </div>
      </div>
      <div className="news-container">
        <img src={news} alt="NEWS" className="news" />
      </div>
    </div >
  );
};

export default HomePage;