import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/FavoriteMenu.css';
import '../css/Navbar.css';
import unknowMenuImage from '../image/menu-suggestion/notfound-image.svg';

const FavoriteMenu = () => {
  const [selected, setSelected] = useState('favorites');
  const [likedMeals, setLikedMeals] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;

      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/favorites/${userId}`);
        const formatted = res.data.map(item => ({
          id: item.menu_id,
          title: item.menu_name,
          prepTime: item.prep_time,
          cookingTime: item.cooking_time,
          image: item.image || unknowMenuImage,
          alt: item.menu_name
        }));
        setLikedMeals(formatted);
      } catch (err) {
        console.error("Error fetching favorites:", err);
      }
    };

    fetchFavorites();
  }, []);

  const handleUnlike = async (mealId) => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/favorites`, {
        data: { user_id: userId, menu_id: mealId }
      });
      setLikedMeals(prev => prev.filter(meal => meal.id !== mealId));
    } catch (err) {
      console.error("Error removing favorite:", err);
    }
  };

  return (
    <div className="favorite-menu-container">
      <div className="header">
        <h1 className="title-meal">Liked Meals</h1>
      </div>

      <div className="meal-list">
        {likedMeals.length === 0 ? (
          <div className="empty-state">
            <p>No liked meals yet</p>
          </div>
        ) : (
          likedMeals.map((meal, index) => (
            <div key={meal.id}>
              <div className="meal-card">
                <div className="meal-content" onClick={() => navigate('/menu-detail', { state: { menu_id: meal.id } })}>
                  <div className="meal-image">
                    <img src={meal.image} alt={meal.alt} />
                  </div>
                  <div className="meal-info">
                    <h3 className="meal-title">{meal.title}</h3>
                    <div className="meal-times">
                      <p>Prep time: {meal.prepTime}</p>
                      <p>Cooking time: {meal.cookingTime}</p>
                    </div>
                  </div>
                </div>
                <button className="favorite-heart" onClick={() => handleUnlike(meal.id)}>
                  <i className="fas fa-heart heart-fav"></i>
                </button>
              </div>
              {index < likedMeals.length - 1 && <div className="meal-separator"></div>}
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default FavoriteMenu;
