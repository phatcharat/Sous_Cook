// MenuSuggestion.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { getMenuFromLocalStorage } from '../utils/storageUtils';
import '../css/MenuSuggestion.css';
import NotFoundImage from '../image/menu-suggestion/notfound-image.svg';
import axios from 'axios';

const MenuSuggestion = () => {
  const [recommendations, setRecommendations] = useState([]);
  const navigate = useNavigate();

const saveMenuToDB = async (menu) => {
  try {
    // First, check if menu already exists by name
    const existingMenu = await axios.get(
      `${process.env.REACT_APP_BACKEND_URL}/menus/by-name/${encodeURIComponent(menu.menu_name)}`
    ).catch(() => null); // Return null if not found

    if (existingMenu?.data?.menu_id) {
      console.log(`Menu "${menu.menu_name}" already exists with ID: ${existingMenu.data.menu_id}`);
      return { ...menu, menu_id: existingMenu.data.menu_id };
    }

    // If not exists, create new
    const payload = {
      menu_name: menu.menu_name,
      prep_time: menu.prep_time || null,
      cooking_time: menu.cooking_time || null,
      steps: menu.steps || [],
      ingredients_quantity: menu.ingredients_quantity || [],
      ingredients_type: menu.ingredients_type || [],
      nutrition: menu.nutrition || [],
      tips: menu.tips || [],
      image: menu.image || null,
    };

    const res = await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/menus`,
      payload
    );

    console.log("Save menu response:", res.data);

    if (res.data && res.data.menu && res.data.menu.menu_id) {
      return { ...menu, menu_id: res.data.menu.menu_id };
    }

    return menu;

  } catch (err) {
    console.error("Error saving menu to DB:", err);
    return menu;
  }
};

  useEffect(() => {
    const storedRecommendations = getMenuFromLocalStorage();
    console.log("storedRecommendations:", storedRecommendations);

    if (storedRecommendations && storedRecommendations.menus && Array.isArray(storedRecommendations.menus)) {
      // Save menus to DB and get IDs, then set state once
      Promise.all(storedRecommendations.menus.map(menu => saveMenuToDB(menu)))
        .then((menusWithIds) => {
          setRecommendations(menusWithIds);
          console.log("Recommendations with IDs:", menusWithIds);
        })
        .catch(err => {
          console.error("Error processing recommendations:", err);
          // Fallback to showing menus without IDs
          setRecommendations(storedRecommendations.menus);
        });
    } else {
      console.error("Recommendations are not in a valid format:", storedRecommendations);
      setRecommendations([]);
    }
  }, []);

  const goToMenuDetail = (menu) => {
    // The menu_id should now be present in the menu object.
    if (menu.menu_id) {
      navigate('/menu-detail', { state: { menu, menu_id: menu.menu_id } });
    } else {
      console.error('Cannot navigate to details, menu_id is missing.', menu);
      // Optional: Fallback to fetch by name if ID is still missing for some reason
      axios.get(`${process.env.REACT_APP_BACKEND_URL}/menus/by-name/${encodeURIComponent(menu.menu_name)}`)
        .then(res => {
          const menuFromDB = res.data;
          navigate('/menu-detail', { state: { menu, menu_id: menuFromDB.menu_id } });
        })
        .catch(err => console.error('Fallback to get menu_id from DB failed', err));
    }
  };

  const onBack = () => {
    navigate('/preferences');
  };

  return (
    <div className="menu-suggestion-container">
      <div className='menu-header-container'>
        <button className="back-button" onClick={onBack}></button>
        <h1>Menu Suggestions</h1>
      </div>
      
      {recommendations.length > 0 ? (
        <ul className="menu-list">
          {recommendations.map((menu, index) => (
            <li key={index} className="menu-item" onClick={() => goToMenuDetail(menu)}>
              <img
                src={menu.image || NotFoundImage}
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