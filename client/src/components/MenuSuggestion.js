// MenuSuggestion.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { getMenuFromLocalStorage,getImageFromLocalStorage,saveImageToLocalStorage } from '../utils/storageUtils';
import '../css/MenuSuggestion.css';
import NotFoundImage from '../image/menu-suggestion/notfound-image.svg';
import axios from 'axios';

const MenuSuggestion = () => {
  const [recommendations, setRecommendations] = useState([]);
  const navigate = useNavigate();

  // Save menu to DB and return menu with menu_id
  const saveMenuToDB = async (menu) => {
    try {
      const existingMenu = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/menus/by-name/${encodeURIComponent(menu.menu_name)}`
      ).catch(() => null);

      if (existingMenu?.data?.menu_id) {
        return { ...menu, menu_id: existingMenu.data.menu_id, image: existingMenu.data.image || menu.image };
      }

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

      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/menus`, payload);
      if (res.data?.menu?.menu_id) {
        return { ...menu, menu_id: res.data.menu.menu_id, image: res.data.menu.image || menu.image };
      }

      return menu;
    } catch (err) {
      console.error("Error saving menu to DB:", err);
      return menu;
    }
  };

  // Fetch image from API or backend and cache
  const fetchMenuImage = async (menu) => {
    const imagesCache = getImageFromLocalStorage();
    if (imagesCache[menu.menu_name]) return imagesCache[menu.menu_name];

    let imageUrl = menu.image || NotFoundImage;

    try {
      if (!menu.image) {
        const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/get_ingredient_image`, {
          ingredients: [menu.menu_name]
        });
        if (res.data?.[0]?.imageUrl) {
          imageUrl = res.data[0].imageUrl;
        }
      }
    } catch (err) {
      console.warn(`Failed to fetch image for ${menu.menu_name}`, err);
    }

    // Cache in localStorage
    saveImageToLocalStorage({ ...imagesCache, [menu.menu_name]: imageUrl });
    return imageUrl;
  };

  // Update menu image in DB
  const updateMenuImageInDB = async (menu_id, imageUrl) => {
    try {
      if (!menu_id || !imageUrl) return;
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/menus/${menu_id}`, { image: imageUrl });
    } catch (err) {
      console.error(`Failed to update menu image in DB: ${menu_id}`, err);
    }
  };

  useEffect(() => {
    const initRecommendations = async () => {
      const storedRecommendations = getMenuFromLocalStorage();
      if (!storedRecommendations?.menus?.length) {
        setRecommendations([]);
        return;
      }

      const menusWithData = [];

      for (const menu of storedRecommendations.menus) {
        // Save menu then get menu_id
        const menuWithId = await saveMenuToDB(menu);

        // Fetch image from API or backend
        const imageUrl = await fetchMenuImage(menuWithId);

        // Update DB if image not yet saved or image = null
        if (!menuWithId.image && menuWithId.menu_id && imageUrl) {
          await updateMenuImageInDB(menuWithId.menu_id, imageUrl);
        }

        // Push final menu object
        menusWithData.push({ ...menuWithId, image: imageUrl });
      }

      setRecommendations(menusWithData);
    };

    initRecommendations();
  }, []);

  const goToMenuDetail = async (menu) => {
    let menuId = menu.menu_id;
    if (!menuId) {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/menus/by-name/${encodeURIComponent(menu.menu_name)}`);
        menuId = res.data.menu_id;
      } catch (err) {
        console.error('Menu not found in DB:', err);
        return;
      }
    }
    navigate('/menu-detail', { state: { menu, menu_id: menuId } });
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