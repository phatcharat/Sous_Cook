// MenuSuggestion.js

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link for navigation
import { getMenuFromLocalStorage } from '../utils/storageUtils';
import '../css/MenuSuggestion.css'; // Ensure you have the correct CSS for layout and styling

const MenuSuggestion = () => {
  const [recommendations, setRecommendations] = useState([]);
  const navigate = useNavigate(); // Initialize navigate hook for back navigation

  useEffect(() => {
    // Retrieve menu recommendations from local storage
    const storedRecommendations = getMenuFromLocalStorage();
    console.log("storedRecommendations:", storedRecommendations);

    if (storedRecommendations && storedRecommendations.menus && Array.isArray(storedRecommendations.menus)) {
      setRecommendations(storedRecommendations.menus);
    } else {
      console.error("Recommendations are not in a valid format:", storedRecommendations);
      setRecommendations([]); // Handle invalid data gracefully
    }
  }, []);

  const onBack = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="menu-suggestion-container">
      <button className="back-button" onClick={onBack}>←</button>
      <h1>Menu Suggestions</h1>
      {recommendations.length > 0 ? (
        <ul className="menu-list">
          {recommendations.map((menu, index) => (
            <li key={index} className="menu-item" onClick={() => navigate(`/menu-detail/${index}`, { state: { menu } })}>
                <img
                    src={menu.image || 'placeholder-image-url.jpg'} // Use a default placeholder if image is missing
                    alt={menu.menu_name}
                    className="menu-image"
                />
                <div className="menu-details">
                    <h2>{menu.menu_name}</h2>
                    <p>Prep time: {menu.prep_time || 'N/A'}</p>
                    <p>Cooking time: {menu.cooking_time || 'N/A'}</p>
                </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No recommendations available.</p>
      )}
    </div>
  );
};

export default MenuSuggestion;
