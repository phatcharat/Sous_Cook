// MenuDetail.js

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/MenuDetail.css'; // Create a CSS file for styling
import { getIngredientsFromLocalStorage, printData} from '../utils/storageUtils';
const MenuDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { menu } = location.state || {};

  if (!menu) {
    return (
      <div className="menu-detail-container">
        <p>No menu details available.</p>
        <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
      </div>
    );
  }
  console.log("Data from local store");
  printData("menus");
  const list_ingredients = getIngredientsFromLocalStorage();
  console.log(`ingredients : ${JSON.stringify(list_ingredients)}` );

  return (
    <div className="menu-detail-container">
      <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
      <img
        src={menu.image || 'placeholder-image-url.jpg'}
        alt={menu.menu_name}
        className="menu-image-large"
      />
      <div className='text-container'>
      <h2>Ingredients</h2>
        <p>You can click which one you already have</p>

        <div className="ingredients-container">
        {menu.ingredients_quantity && list_ingredients.filter(ingredient => {
            // Filter for main ingredients (excluding miscellaneous items)
            return ingredient.ingredient_type !== 'Miscellaneous items';
            }).map((ingredient, idx) => (
            <div key={idx} className="ingredient-item">
                <img
                src={`path_to_images/${ingredient.ingredient_name.toLowerCase().replace(' ', '_')}.png`} // Adjust image path
                alt={ingredient.ingredient_name}
                className="ingredient-image"
                />
                <p>{ingredient.ingredient_name}</p>
            </div>
            ))}
        </div>

        <h2>Seasoning/Dressing</h2>
        <div className="seasoning-container">
        {menu.ingredients_quantity && list_ingredients.filter(ingredient => {
            // Filter for seasoning or dressing (miscellaneous items)
            return ingredient.ingredient_type === 'Miscellaneous items';
            }).map((ingredient, idx) => (
            <div key={idx} className="ingredient-item">
                <img
                src={`path_to_images/${ingredient.ingredient_name.toLowerCase().replace(' ', '_')}.png`} // Adjust image path
                alt={ingredient.ingredient_name}
                className="ingredient-image"
                />
                <p>{ingredient.ingredient_name}</p>
            </div>
            ))}
        </div>



        <h2>Steps</h2>
        <ol>
            {menu.steps && menu.steps.map((step, idx) => (
            <li key={idx}>{step}</li>
            ))}
        </ol>
      </div>
      
    </div>
  );
};

export default MenuDetail;
