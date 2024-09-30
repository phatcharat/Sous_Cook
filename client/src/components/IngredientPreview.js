import React, { useEffect, useState } from 'react';
import { saveIngredientsToLocalStorage, getIngredientsFromLocalStorage } from '../utils/storageUtils';
import '../css/IngredientPreview.css';
import PreferencesPage from './PreferencesPage';

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

const IngredientPreview = ({ updatedIngredients }) => {
  const [ingredients, setIngredients] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [isReferencePage, setIsReferencePage] = useState(false); // State to control page navigation

  // Fetch stored ingredients when the component mounts
  useEffect(() => {
    const storedIngredients = getIngredientsFromLocalStorage();
    setIngredients(storedIngredients);
  }, []);

  // Update ingredients when a new image is processed
  useEffect(() => {
    if (updatedIngredients) {
      const newIngredientsList = [...ingredients, ...updatedIngredients];
      setIngredients(newIngredientsList); // Update state with new ingredients
      saveIngredientsToLocalStorage(newIngredientsList); // Update localStorage
    }
  }, [updatedIngredients]);

  // Mapping ingredient types to icons
  const getIconForIngredientType = (ingredientType) => {
    switch (ingredientType) {
      case 'Eggs, milk, and dairy products':
        return EggMilkDairy;
      case 'Fats and oils':
        return FatsOils;
      case 'Fruits':
        return Fruits;
      case 'Grains, nuts, and baking products':
        return GrainsNutsBaking;
      case 'Herbs and spices':
        return HerbsSpices;
      case 'Meat, sausages, and fish':
        return MeatSausagesFish;
      case 'Pasta, rice, and pulses':
        return PastaRicePulses;
      case 'Vegetables':
        return Vegetables;
      case 'Miscellaneous items':
      default:
        return Miscellaneous;
    }
  };

  // Handle confirm button click to go to PreferencesPage
  const handleConfirm = () => {
    setIsReferencePage(true); // Change the state to navigate to PreferencesPage
  };

  // Function to handle navigation back from PreferencesPage
  const handleBackToIngredientPreview = () => {
    setIsReferencePage(false); // Navigate back to the IngredientPreview page
  };

  // Handle editing an ingredient
  const handleEdit = (index) => {
    setEditIndex(index);
    setEditedName(ingredients[index].ingredient_name);
  };

  // Handle saving the edited ingredient
  const handleSaveEdit = (index) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index].ingredient_name = editedName;
    setIngredients(updatedIngredients);
    saveIngredientsToLocalStorage(updatedIngredients);
    setEditIndex(null); // Exit edit mode
  };

  // Handle canceling the edit
  const handleCancelEdit = () => {
    setEditIndex(null); // Exit edit mode
  };

  // Handle deleting an ingredient
  const handleDelete = (index) => {
    const updatedList = ingredients.filter((_, i) => i !== index); // Remove the ingredient at the specified index
    setIngredients(updatedList);
    saveIngredientsToLocalStorage(updatedList); // Update the localStorage with the updated list
  };

  return (
    <>
      {isReferencePage ? (
        // Render PreferencesPage and pass the back function
        <PreferencesPage onBack={handleBackToIngredientPreview} />
      ) : (
        <div className="ingredient-preview-container">
          <h1 className="ingredient-header">Ingredient List</h1>
          <ul className="ingredient-list">
            {ingredients.map((ingredient, index) => {
              if (!ingredient || typeof ingredient !== 'object' || !ingredient.ingredient_name || !ingredient.ingredient_type) {
                console.error(`Invalid ingredient at index ${index}:`, ingredient);
                return null; // Skip rendering invalid items
              }

              const iconSrc = getIconForIngredientType(ingredient.ingredient_type);

              return (
                <li key={index} className="ingredient-item">
                  <img src={iconSrc} alt={`${ingredient.ingredient_type} icon`} className="ingredient-icon" />
                  {editIndex === index ? (
                    // Edit Mode: Input field and Save/Cancel buttons
                    <>
                      <input 
                        type="text" 
                        value={editedName} 
                        onChange={(e) => setEditedName(e.target.value)} 
                        className="ingredient-edit-input"
                      />
                      <button className="save-btn" onClick={() => handleSaveEdit(index)}>💾</button>
                      <button className="cancel-btn" onClick={handleCancelEdit}>✖️</button>
                    </>
                  ) : (
                    // Display Mode: Ingredient name and Edit/Delete buttons
                    <>
                      <span>{ingredient.ingredient_name}</span>
                      <div className=''>
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
          <button className="confirm-btn" onClick={handleConfirm}>Confirm</button>
        </div>
      )}
    </>
  );
};

export default IngredientPreview;
