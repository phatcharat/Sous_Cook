import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/MenuDetail.css'; 
import { getIngredientsFromLocalStorage, getImageFromLocalStorage, saveImageToLocalStorage } from '../utils/storageUtils';
import checkbox from '../image/menu-detail/Checkbox.svg';
import checkboxOncheck from '../image/menu-detail/Checkbox_check.svg';
import axios from 'axios';

const MenuDetail = () => { 
    const navigate = useNavigate();
    const location = useLocation();
    const { menu } = location.state || {};
    const ingredient_type = getIngredientsFromLocalStorage();
  
    const [checkedSteps, setCheckedSteps] = useState([]);
    const [ingredientImages, setIngredientImages] = useState([]);
  
    const handleCheck = (index) => {
      if (checkedSteps.includes(index)) {
        setCheckedSteps(checkedSteps.filter(stepIndex => stepIndex !== index));
      } else {
        setCheckedSteps([...checkedSteps, index]);
      }
    };
    //console.log("ingredient Object:", ingredient_type); // Log the entire menu object

    useEffect(() => {
        if (!menu) {
          console.error("Menu is not available.");
          return;
        }
      
        //console.log("Menu Object:", menu); // Log the entire menu object
      
        if (!menu.ingredients_quantity || typeof menu.ingredients_quantity !== 'object') {
          console.error("Ingredients are not available or not an object.");
          console.log("menu.ingredients_quantity:", menu.ingredients_quantity); // Log the value of ingredients_quantity
          return;
        }
      
        const ingredientList = Object.keys(menu.ingredients_quantity); // Extract the ingredient names
        const menuList = [menu]; // Assuming menu contains menu name and image
      
        const fetchImages = async () => {
          const images = await fetchMissingImages(menuList, ingredientList);
          setIngredientImages(images.ingredient);
        };
      
        fetchImages();
      }, [menu]);      
      

    if (!menu) {
      return (
        <div className="menu-detail-container">
          <p>No menu details available.</p>
          <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
        </div>
      );
    }

    return (
        <div className="menu-detail-container">
        <button className="back-button" onClick={() => navigate(-1)}></button>
        <img
            src={menu.image || 'placeholder-image-url.jpg'}
            alt={menu.menu_name}
            className="menu-image-large"
        />
        <div className="text-container">
        <h2>Ingredients</h2>
        <p>You can click which one you already have</p>

        <div className="ingredients-container">
        {menu.ingredients_quantity && Object.entries(menu.ingredients_quantity)
            .filter(([ingredientName, _]) => {
            const ingredientObj = ingredient_type.find(i => i.ingredient_name === ingredientName);
            return ingredientObj && ingredientObj.ingredient_type !== 'Miscellaneous items';
            })
            .map(([ingredientName, quantity], idx) => (
            <div key={idx} className="ingredient-item">
                <img
                src={ingredientImages[ingredientName] || 'placeholder-image-url.jpg'}
                alt={ingredientName}
                className="ingredient-image"
                />
                <p>{ingredientName}: {quantity}</p>
            </div>
        ))}
        </div>

        <h2>Seasoning/Dressing</h2>
        <div className="seasoning-container">
        {menu.ingredients_quantity && Object.entries(menu.ingredients_quantity)
            .filter(([ingredientName, _]) => {
            const ingredientObj = ingredient_type.find(i => i.ingredient_name === ingredientName);
            return ingredientObj && ingredientObj.ingredient_type === 'Miscellaneous items';
            })
            .map(([ingredientName, quantity], idx) => (
            <div key={idx} className="ingredient-item">
                <img
                src={ingredientImages[ingredientName] || 'placeholder-image-url.jpg'}
                alt={ingredientName}
                className="ingredient-image"
                />
                <p>{ingredientName}: {quantity}</p>
            </div>
        ))}
        </div>


        <h2>Instructions</h2>
        <ul className="instructions-list">
        {menu.steps && menu.steps.map((step, idx) => (
            <li key={idx} className={checkedSteps.includes(idx) ? 'checked-step' : ''}>
            <label className="checkbox-label">
                <input
                type="checkbox"
                checked={checkedSteps.includes(idx)}
                onChange={() => handleCheck(idx)}
                className="custom-checkbox"
                />
                <span className="custom-checkbox-styled">
                <img 
                    src={checkedSteps.includes(idx) ? checkboxOncheck : checkbox} 
                    alt="Checkbox" 
                />
                </span>
                {step}
            </label>
            </li>
        ))}
        </ul>
        </div>
    </div>
    );
};

const fetchMissingImages = async (menuList, ingredientList) => {
    let storedImages = getImageFromLocalStorage();
    
    if (!Array.isArray(storedImages.menu)) {
        storedImages.menu = [];
      }
      
    if (!storedImages) {
        storedImages = { menu: [], ingredient: {} }; // Ensure proper initialization
    }

    const missingMenuItems = menuList.filter(menuItem => 
        Array.isArray(storedImages.menu) && !storedImages.menu.some(storedMenu => storedMenu.name === menuItem.name)
    );

    const missingIngredients = ingredientList.filter(ingredient => 
        storedImages.ingredient && !(ingredient in storedImages.ingredient)
    );

    console.log("missingMenuItems:", missingMenuItems);
    console.log("missingIngredients:", missingIngredients);

    if (missingMenuItems.length > 0 || missingIngredients.length > 0) {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/get_ingredient_image`, { ingredients: missingIngredients });
            const fetchedImages = response.data;

            const newImages = {
                menu: [...storedImages.menu, ...missingMenuItems.map(item => ({ name: item.name, image: item.image }))],
                ingredient: { ...storedImages.ingredient, ...Object.fromEntries(fetchedImages.map(ingredient => [ingredient.ingredient, ingredient.imageUrl])) },
            };

            saveImageToLocalStorage(newImages);
            return newImages;
        } catch (error) {
            console.error('Error fetching images from backend:', error);
            return storedImages; // Return what we have so far
        }
    }

    return storedImages;
};

  

export default MenuDetail;
