import React, { useEffect, useState } from 'react';
import { saveIngredientsToLocalStorage, getIngredientsFromLocalStorage, addDeletedIngredient, getDeletedIngredients } from '../utils/storageUtils';
import '../css/IngredientPreview.css';
import PreferencesPage from './PreferencesPage';
import { useNavigate, useLocation } from "react-router-dom";

// Importing SVG icons for different ingredient types
import EggMilkDairy from '../Icon/Ingredient/Egg, milk, and dairy product.svg';
import FatsOils from '../Icon/Ingredient/Fats and oils.svg';
import Fruits from '../Icon/Ingredient/Fruits.svg';
import GrainsNutsBaking from '../Icon/Ingredient/Grains, nuts, and baking products.svg';
import HerbsSpices from '../Icon/Ingredient/Herbs and spices.svg';
import MeatSausagesFish from '../Icon/Ingredient/Meat, sausages and fish.svg';
import Miscellaneous from '../Icon/Ingredient/Other.svg';
import PastaRicePulses from '../Icon/Ingredient/Pasta, rice, and pulses.svg';
import Vegetables from '../Icon/Ingredient/Vegetable.svg';

import editBtn from '../Icon/Button/Edit_btn.png';
import deleteBtn from '../Icon/Button/Delete_btn.png';
import addBtn from '../Icon/Button/Add_btn.svg';

const IngredientPreview = ({ updatedIngredients }) => {
  const location = useLocation();
  const [ingredients, setIngredients] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [isReferencePage, setIsReferencePage] = useState(false);
  const navigate = useNavigate();

  // filter ingredients name
  const getUniqueIngredients = (ingredients) => {
    const seen = new Set();
    const deleted = getDeletedIngredients();
    return ingredients.filter(ing => {
      const name = ing.ingredient_name?.trim();
      if (!name || seen.has(name) || deleted.includes(name.toLowerCase())) return false;
      seen.add(name);
      return true;
    });
  };

  // Fetch stored ingredients when the component mounts
  useEffect(() => {
    let allIngredients = [];
    if (location.state?.currentIngredients) {
      allIngredients = location.state.currentIngredients;
    } else {
      allIngredients = getIngredientsFromLocalStorage();
    }
    setIngredients(getUniqueIngredients(allIngredients));
  }, [location.state]);

  useEffect(() => {
    if (updatedIngredients) {
      const newIngredientsList = [...ingredients, ...updatedIngredients];
      setIngredients(getUniqueIngredients(newIngredientsList));
      saveIngredientsToLocalStorage(getUniqueIngredients(newIngredientsList));
    }
  }, [updatedIngredients]);

  // Mapping ingredient types to icons
  const getIconForIngredientType = (ingredientType = "") => {
    const type = ingredientType.toLowerCase();
    if (type.includes("egg") || type.includes("dairy products") || type.includes("milk")) return EggMilkDairy;
    if (type.includes("fats") || type.includes("oils")) return FatsOils;
    if (type.includes("fruits")) return Fruits;
    if (type.includes("grains") || type.includes("nuts") || type.includes("baking")) return GrainsNutsBaking;
    if (type.includes("herbs") || type.includes("spices")) return HerbsSpices;
    if (type.includes("meat") || type.includes("sausages") || type.includes("fish")) return MeatSausagesFish;
    if (type.includes("pasta") || type.includes("rice") || type.includes("pulses")) return PastaRicePulses;
    if (type.includes("vegetables")) return Vegetables;

    return Miscellaneous; // default
  };

  // Handle confirm button click to go to PreferencesPage
  const handleConfirm = () => {
    setIsReferencePage(true);
  };

  // Function to handle navigation back from PreferencesPage
  const handleBackToIngredientPreview = () => {
    setIsReferencePage(false);
  };

  // Handle editing an ingredient
  const handleEdit = (index) => {
    setEditIndex(index);
    setEditedName(ingredients[index].ingredient_name);
  };

  // Updated saveIngredients function - ALWAYS save to localStorage
  const saveIngredients = (updatedList) => {
    setIngredients(updatedList);
    // Always save to localStorage so SearchBar can pick up changes
    saveIngredientsToLocalStorage(updatedList);
  };

  // Handle saving the edited ingredient
  const handleSaveEdit = (index) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index].ingredient_name = editedName;
    saveIngredients(updatedIngredients);
    setEditIndex(null);
    setEditedName('');
  };

  // Handle canceling the edit
  const handleCancelEdit = () => {
    setEditIndex(null);
  };

  // Handle deleting an ingredient
  const handleDelete = (index) => {
    const deletedName = ingredients[index].ingredient_name;
    addDeletedIngredient(deletedName);
    const updatedList = ingredients.filter((_, i) => i !== index);
    saveIngredients(updatedList);
  };

  // Handle adding new ingredient - navigate back to SearchBar
  const handleAddIngredient = () => {
    // Save current ingredients before navigating
    saveIngredientsToLocalStorage(ingredients);
    navigate('/search');
  };

  // Handle back button - save changes before going back
  const handleBack = () => {
    saveIngredientsToLocalStorage(ingredients);
    navigate('/search');
  };

  return (
    <>
      {isReferencePage ? (
        <PreferencesPage onBack={handleBackToIngredientPreview} />
      ) : (
        <div className="ingredient-preview-container">
          <div className='menu-header-container'>
            <button className="back-button" onClick={handleBack}></button>
            <h1 className="ingredient-header">Ingredient List</h1>
          </div>
          <ul className="ingredient-list">
            {ingredients.map((ingredient, index) => {
              if (!ingredient || typeof ingredient !== 'object' || !ingredient.ingredient_name || !ingredient.ingredient_type) {
                console.error(`Invalid ingredient at index ${index}:`, ingredient);
                return null;
              }

              const iconSrc = getIconForIngredientType(ingredient.ingredient_type);

              return (
                <li key={index} className="ingredient-items">
                  <img src={iconSrc} alt={`${ingredient.ingredient_type} icon`} className="ingredient-icon" />
                  {editIndex === index ? (
                    <>
                      <input 
                        type="text" 
                        value={editedName} 
                        onChange={(e) => setEditedName(e.target.value)} 
                        className="ingredient-edit-input"
                      />
                      <button className="save-btn" onClick={() => handleSaveEdit(index)}>
                        Save
                      </button>
                      <button className="cancel-btn" onClick={handleCancelEdit}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span>{ingredient.ingredient_name}</span>
                      <div className='ingredient-actions'>
                        <button className="edit-btn" onClick={() => handleEdit(index)}>
                          <img src={editBtn} alt="Edit" />
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(index)}>
                          <img src={deleteBtn} alt="Delete" />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
          
          {/* Plus button to add ingredient, navigates to search bar */}
          <button className="plus-btn" onClick={handleAddIngredient}>
            <img src={addBtn} alt="Add ingredient" style={{width: '32px', height: '32px'}} />
          </button>
          
          <button className="confirm-btn" onClick={handleConfirm}>CONFIRM</button>
        </div>
      )}
    </>
  );
};

export default IngredientPreview;