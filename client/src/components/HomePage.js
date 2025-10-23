import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import '../css/HomePage.css';
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
  const [isNavigating, setIsNavigating] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [shoppingListCount, setShoppingListCount] = useState(0);

  // State สำหรับข้อมูลสถิติ
  const [chartData, setChartData] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [currentMonthMeals, setCurrentMonthMeals] = useState(0);
  const [currentMonthCO2, setCurrentMonthCO2] = useState(0);

  const logSafeUserEvent = (event, details = {}) => {
    const safeDetails = { ...details };
    if (safeDetails.userId) safeDetails.userId = '****';
    if (safeDetails.username) safeDetails.username = '****';
    if (safeDetails.email) safeDetails.email = '****';
    console.log(`Event: ${event}`, safeDetails);
  };

  useEffect(() => {
    const userId = getUserId();
    const loggedIn = isLoggedIn();
    setIsUserLoggedIn(loggedIn);

    const fetchUserData = async () => {
      try {
        if (!userId) {
          logSafeUserEvent('auth_check', { status: 'not_authenticated' });
          setUsername("USER");
          setStatsLoading(false);
          return;
        }

        // ดึงข้อมูล user
        const userResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/users/${userId}`);
        const user = userResponse.data.user;

        logSafeUserEvent('user_data_fetch', {
          status: 'success',
          hasData: !!user
        });

        if (user && user.username) {
          setUsername(user.username.toUpperCase() + "!");
        }

        // ดึงข้อมูลสถิติรายเดือน
        const statsResponse = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/users/${userId}/monthly-meal-stats`
        );

        const stats = statsResponse.data;

        // แปลงข้อมูลให้เป็นรูปแบบสำหรับกราฟ
        const formattedData = stats.monthly_stats.map(item => ({
          month: item.month,
          value: item.meal_count
        }));

        setChartData(formattedData);
        setCurrentMonthMeals(stats.current_month.meal_count);
        setCurrentMonthCO2(parseFloat(stats.current_month.co2_saved));
        setStatsLoading(false);

      } catch (error) {
        logSafeUserEvent('user_data_fetch', {
          status: 'error',
          errorType: error.response?.status === 401 ? 'unauthorized' : 'fetch_failed'
        });

        if (error.response?.status === 401 || error.response?.status === 403) {
          logSafeUserEvent('guest_access');
        }
        setStatsLoading(false);
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

  const smoothNavigate = (path, state = {}) => {
    setIsNavigating(true);
    
    setTimeout(() => {
      navigate(path, { state });
    }, 150);
  };

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

  // ค่าคงที่สำหรับกราฟ - ขยายความสูงโดยลด bottomPadding
  const chartWidth = 314;
  const chartHeight = 220;
  const leftPadding = 35;
  const rightPadding = 15;
  const topPadding = 15;
  const bottomPadding = 28;

  const getChartBounds = () => {
    if (chartData.length === 0) {
      return { minValue: 0, maxValue: 20 };
    }

    const values = chartData.map(d => d.value);
    const maxDataValue = Math.max(...values);

    if (maxDataValue === 0) {
      return { minValue: 0, maxValue: 5 };
    }

    // กำหนด maxValue ให้เป็นค่าที่หารลงตัว
    let niceMax;
    if (maxDataValue <= 5) {
      niceMax = 5;
    } else if (maxDataValue <= 10) {
      niceMax = 10;
    } else if (maxDataValue <= 20) {
      niceMax = 20;
    } else if (maxDataValue <= 50) {
      niceMax = Math.ceil(maxDataValue / 10) * 10;
    } else {
      niceMax = Math.ceil(maxDataValue / 20) * 20;
    }

    return {
      minValue: 0,
      maxValue: niceMax
    };
  };

  const { minValue, maxValue } = getChartBounds();

  const plotWidth = chartWidth - leftPadding - rightPadding;
  const plotHeight = chartHeight - topPadding - bottomPadding;

  // กำหนดจำนวน Grid Lines ตาม maxValue
  const getGridCount = (max) => {
    if (max <= 5) return 6;    
    if (max <= 10) return 6;   
    if (max <= 20) return 5;  
    if (max <= 50) return 6;   
    return 5;
  };

  const gridLines = getGridCount(maxValue);

  // ฟังก์ชันคำนวณตำแหน่ง Y ที่แม่นยำ
  const calculateY = (value) => {
    return topPadding + plotHeight - ((value / maxValue) * plotHeight);
  };

  // ฟังก์ชันคำนวณตำแหน่ง X
  const calculateX = (index, dataLength) => {
    if (dataLength === 1) {
      return leftPadding + plotWidth / 2;
    }
    return leftPadding + (index * plotWidth) / (dataLength - 1);
  };

  const createPath = (data) => {
    if (data.length === 0) return '';

    const points = data.map((point, index) => {
      const x = calculateX(index, data.length);
      const y = calculateY(point.value);
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  // สร้าง array ของค่า Grid
  const getGridValues = () => {
    const values = [];
    const step = maxValue / (gridLines - 1);
    
    for (let i = 0; i < gridLines; i++) {
      values.push(Math.round(step * i));
    }
    
    return values;
  };

  const gridValues = getGridValues();

  const handleRandomMenu = async () => {
    setIsLoadingRandom(true);

    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/random-menu`);

      if (response.data.success && response.data.menu?.menu_id) {
        smoothNavigate('/menu-detail', {
          menu: response.data.menu,
          menu_id: response.data.menu.menu_id,
          isRandomMenu: true
        });
      }
    } catch (error) {
      console.error('Error:', error);
      alert("Failed to generate menu. Please try again.");
      setIsLoadingRandom(false);
    }
  };
  const handleListIconClick = () => {
    const shoppingList = getShoppingListFromStorage();
    smoothNavigate("/shoppinglist", { missingIngredients: shoppingList });
  };

  const handleSearchClick = () => {
    smoothNavigate("/search");
  };

  return (
    <div className={`homepage-container ${isNavigating ? 'navigating' : ''}`}>
      <img src={header} alt="Header" className="header-image" />
      <div className="second-container">
        <p className="greet-user">HELLO <span className="username">{username}</span></p>
        <div className="list-icon-container">
          <img 
            src={listicon} 
            alt="List" 
            className="list-icon" 
            onClick={handleListIconClick}
            style={{ cursor: isNavigating ? "not-allowed" : "pointer" }} 
          />
          {shoppingListCount > 0 && (
            <span className="list-badge">{shoppingListCount}</span>
          )}
        </div>
      </div>

      <p className="question-text">What's on your mind today chef?</p>
      <div 
        className="search-box" 
        onClick={handleSearchClick}
        style={{ cursor: isNavigating ? "not-allowed" : "pointer" }}
      >
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

      <div className="food-waste-stat">
        <p className="food-waste-text">Food Waste Reduction Stat</p>
        <div className="chart-box">
          <svg className="chart-svg" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            {/* Horizontal grid lines */}
            {gridValues.map((value, i) => {
              const y = calculateY(value);
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
              const x = calculateX(i, chartData.length);
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
              const x = calculateX(index, chartData.length);
              const y = calculateY(point.value);
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#B0BD39"
                  stroke="#fff"
                  strokeWidth="2"
                />
              );
            })}

            {/* Y-axis labels - ใช้ค่าจาก gridValues */}
            {gridValues.map((value, i) => {
              const y = calculateY(value);
              return (
                <text
                  key={`y-label-${i}`}
                  x={leftPadding - 10}
                  y={y + 4}
                  textAnchor="end"
                  style={{
                    fontSize: '13px',
                    fill: '#6D6C6C',
                    fontFamily: 'Quicksand',
                    fontWeight: 500
                  }}
                >
                  {value}
                </text>
              );
            })}

            {/* X-axis labels */}
            {chartData.map((point, index) => {
              const x = calculateX(index, chartData.length);
              return (
                <text
                  key={index}
                  x={x}
                  y={chartHeight - bottomPadding + 20}
                  textAnchor="middle"
                  style={{
                    fontSize: '13px',
                    fill: '#6D6C6C',
                    fontFamily: 'Quicksand',
                    fontWeight: 500
                  }}
                >
                  {point.month}
                </text>
              );
            })}
          </svg>

          <div className="stat-info">
            <p className="stat-text">
              You made <span className="highlight-orange">{currentMonthMeals} {currentMonthMeals === 1 ? 'dish' : 'dishes'}</span> this month
            </p>
            <p className="stat-text">
              Around <span className="highlight-orange">{currentMonthCO2.toFixed(1)} kg</span> of CO2 saved!
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
            style={{ cursor: (isLoadingRandom || isNavigating) ? "not-allowed" : "pointer" }}
            onClick={handleRandomMenu}
            disabled={isLoadingRandom || isNavigating}
          >
            {isLoadingRandom ? 'GENERATING...' : 'START RANDOM'}
          </button>
        </div>
      </div>

      <div className="news-container">
        <img src={news} alt="NEWS" className="news" />
      </div>
    </div>
  );
};

export default HomePage;