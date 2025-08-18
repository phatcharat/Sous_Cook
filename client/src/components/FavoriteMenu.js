import Favorite from '../image/Favorite.svg' // Liked icon
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/FavoriteMenu.css';
import '../css/Navbar.css';
import IconHome from '../image/nav_icon/icon_home.svg';
import IconHeart from '../image/nav_icon/icon_like.svg';
import IconCamera from '../image/nav_icon/icon_camera.svg';
import IconClock from '../image/nav_icon/icon_history.svg';
import IconUser from '../image/nav_icon/icon_people.svg';
import Satay from '../image/Satay.jpg';
import TomYum from '../image/TomYum.jpg';
import Sandwich from '../image/Sandwich.jpg';

const FavoriteMenu = () => {
  const [selected, setSelected] = useState('favorites');
  const [likedMeals, setLikedMeals] = useState([
    {
      id: 1,
      title: "Chicken Satay Skewer with Peanut Sauce",
      prepTime: "15 - 20 mins",
      cookingTime: "30 - 45 mins",
      image: Satay,
      alt: "Chicken satay skewers with peanut sauce"
    },
    {
      id: 2,
      title: "Thai Tom Yum Soup with Shrimp",
      prepTime: "15 - 20 mins", 
      cookingTime: "30 - 45 mins",
      image: TomYum,
      alt: "Thai Tom Yum soup with shrimp"
    },
    {
      id: 3,
      title: "Tuna Salad Sandwich",
      prepTime: "5 - 10 mins",
      cookingTime: "-",
      image: Sandwich,
      alt: "Tuna salad sandwich"
    }
  ]);
  
  const navigate = useNavigate();

  const handleNavigation = (page) => {
    setSelected(page);
    navigate(`/${page}`);
  };

  const handleUnlike = (mealId) => {
    setLikedMeals(prevMeals => prevMeals.filter(meal => meal.id !== mealId));
  };

  return (
    <div className="favorite-menu-container">
      {/* Header */}
      <div className="header">
        <h1 className="title-meal">Liked Meals</h1>
      </div>

      {/* Meal List */}
      <div className="meal-list">
        {likedMeals.length === 0 ? (
          <div className="empty-state">
            <p>No liked meals yet</p>
          </div>
        ) : (
          likedMeals.map((meal, index) => (
            <div key={meal.id}>
              <div className="meal-card">
                <div className="meal-content">
                  {/* Meal Image */}
                  <div className="meal-image">
                    <img 
                      src={meal.image}
                      alt={meal.alt}
                    />
                  </div>
                  
                  {/* Meal Info */}
                  <div className="meal-info">
                    <h3 className="meal-title">
                      {meal.title}
                    </h3>
                    <div className="meal-times">
                      <p className="time-text">
                        Prep time: {meal.prepTime}
                      </p>
                      <p className="time-text">
                        Cooking time: {meal.cookingTime}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Liked Icon */}
                <button 
                  className="favorite-heart"
                  onClick={() => handleUnlike(meal.id)}
                >
                  {/* ✅ Replace the img tag with the i tag */}
                  <i class="fas fa-heart heart-fav"></i>
                </button>
              </div>
              {/* Separator line - don't show after last item */}
              {index < likedMeals.length - 1 && <div className="meal-separator"></div>}
            </div>
          ))
        )}
      </div>

      {/* Navigation Bar */}
      <div className="navbar">
        <a className={`home nav-item ${selected === 'home' ? 'selected' : ''}`} 
           onClick={() => handleNavigation('home')}>
          <img src={IconHome} alt="home" />
        </a>
        <a className={`heart nav-item ${selected === 'favorites' ? 'selected' : ''}`} 
           onClick={() => handleNavigation('favorites')}>
          <img src={IconHeart} alt="favorites" />
        </a>
        <a className={`camera nav-item ${selected === 'camera' ? 'selected' : ''}`} 
           onClick={() => handleNavigation('camera')}>
          <img src={IconCamera} alt="camera" />
        </a>
        <a className={`history nav-item ${selected === 'history' ? 'selected' : ''}`} 
           onClick={() => handleNavigation('history')}>
          <img src={IconClock} alt="history" />
        </a>
        <a className={`account nav-item ${selected === 'account' ? 'selected' : ''}`} 
           onClick={() => handleNavigation('account')}>
          <img src={IconUser} alt="account" />
        </a>
      </div>
    </div>
  );
}

export default FavoriteMenu;