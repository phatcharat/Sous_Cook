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
      const savedMenus = JSON.parse(localStorage.getItem("savedMenus") || "[]");

      if (savedMenus.includes(menu.menu_name)) {
        console.log(`${menu.menu_name} already saved, skipping.`);
        return menu;
      }

      const payload = {
        menu_name: menu.menu_name,
        prep_time: menu.prep_time || null,
        cooking_time: menu.cooking_time || null,
        steps: menu.steps || [],
        ingredients_quantity: menu.ingredients_quantity || [],
        ingredients_type: menu.ingredients_type || [],
        nutrition: menu.nutrition || [],
        image: menu.image || null,
      };

      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/menus`,
        payload
      );

      console.log("Save menu response:", res.data);

      // เพิ่ม menu_id ที่ได้จาก DB เข้าไปใน object
      const menuWithId = { ...menu, menu_id: res.data.id };

      // update localStorage
      localStorage.setItem(
        "savedMenus",
        JSON.stringify([...savedMenus, menu.menu_name])
      );

      return menuWithId;
    } catch (err) {
      console.error("Error saving menu to DB:", err);
      return menu; // ถ้า error ก็ส่ง menu เดิมกลับไป
    }
  };

  useEffect(() => {
    const storedRecommendations = getMenuFromLocalStorage();
    console.log("storedRecommendations:", storedRecommendations);

    if (storedRecommendations && storedRecommendations.menus && Array.isArray(storedRecommendations.menus)) {
      // save แต่ละเมนูลง DB แล้ว update state
      Promise.all(storedRecommendations.menus.map(menu => saveMenuToDB(menu)))
        .then((savedMenus) => {
          setRecommendations(savedMenus);
        });
    } else {
      console.error("Recommendations are not in a valid format:", storedRecommendations);
      setRecommendations([]);
    }
  }, []);

  const goToMenuDetail = async (menu) => {
    try {
      // 1. ดึง menu_id จาก DB
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/menus/by-name/${encodeURIComponent(menu.menu_name)}`);
      const menuFromDB = res.data; // { menu_id, menu_name }

      // 2. navigate ไป MenuDetail พร้อม menu_id
      navigate('/menu-detail', { state: { menu, menu_id: menuFromDB.menu_id } });
    } catch (err) {
      console.error('Cannot get menu_id from DB', err);
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