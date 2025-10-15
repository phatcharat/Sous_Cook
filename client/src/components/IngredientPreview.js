// IngredientPreview.js

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { saveIngredientsToLocalStorage, getIngredientsFromLocalStorage,getCameraIngredientsFromLocalStorage,saveCameraIngredientsToLocalStorage} from '../utils/storageUtils';
import '../css/IngredientPreview.css';
import PreferencesPage from './PreferencesPage';

// Importing SVG icons
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

  const iconMap = {
    "egg": EggMilkDairy, "dairy products": EggMilkDairy, "milk": EggMilkDairy,
    "fats": FatsOils, "oils": FatsOils,
    "fruits": Fruits,
    "grains": GrainsNutsBaking, "nuts": GrainsNutsBaking, "baking": GrainsNutsBaking,
    "herbs": HerbsSpices, "spices": HerbsSpices,
    "meat": MeatSausagesFish, "sausages": MeatSausagesFish, "fish": MeatSausagesFish,
    "pasta": PastaRicePulses, "rice": PastaRicePulses, "pulses": PastaRicePulses,
    "vegetables": Vegetables,
  };

  const getIconForIngredientType = (ingredientType = "") => {
    const typeLower = ingredientType.toLowerCase();
    for (const key in iconMap) {
      if (typeLower.includes(key)) {
        return iconMap[key];
      }
    }
    return Miscellaneous;
  };

  const getUniqueIngredients = (ingredients) => {
    const seen = new Set();
    return ingredients.filter(ing => {
      if (!ing || typeof ing !== 'object') return false;
      const name = ing.ingredient_name?.trim().toLowerCase();
      if (!name || seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  };

useEffect(() => {
  const normalIngredients = getIngredientsFromLocalStorage();
  const cameraIngredients = getCameraIngredientsFromLocalStorage();
  const allIngredients = [...normalIngredients, ...cameraIngredients];
  const uniqueIngredients = getUniqueIngredients(allIngredients);
  setIngredients(uniqueIngredients);
}, []);

  useEffect(() => {
    if (updatedIngredients) {
      setIngredients(prevIngredients => {
        const newIngredientsList = [...prevIngredients, ...updatedIngredients];
        const uniqueList = getUniqueIngredients(newIngredientsList);
        saveIngredientsToLocalStorage(uniqueList);
        return uniqueList;
      });
    }
  }, [updatedIngredients]);

  const handleConfirm = () => setIsReferencePage(true);
  const handleBackToIngredientPreview = () => setIsReferencePage(false);

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditedName(ingredients[index].ingredient_name);
  };

  const saveIngredients = (updatedList) => {
    setIngredients(updatedList);
    saveIngredientsToLocalStorage(updatedList);
  };

  const handleSaveEdit = (index) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index].ingredient_name = editedName;
    saveIngredients(updatedIngredients);
    setEditIndex(null);
    setEditedName('');
  };

  const handleCancelEdit = () => setEditIndex(null);

  const handleDelete = (index) => {
    const ingToDelete = ingredients[index];

    // ลบจาก normal ingredients
    const normalIngredients = getIngredientsFromLocalStorage().filter(ing => ing.ingredient_name !== ingToDelete.ingredient_name);
    saveIngredientsToLocalStorage(normalIngredients);

    // ลบจาก camera ingredients
    const cameraIngredients = getCameraIngredientsFromLocalStorage().filter(ing => ing.ingredient_name !== ingToDelete.ingredient_name);
    saveCameraIngredientsToLocalStorage(cameraIngredients);

    // อัพเดต state
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddIngredient = () => navigate('/search');
  const handleBack = () => navigate('/search');

  return (
    <>
      {isReferencePage ? (
        <PreferencesPage onBack={handleBackToIngredientPreview} />
      ) : (
        <div className="ingredient-preview-container">
          <div className='menu-header-container'>
            <button className="back-button" onClick={handleBack}></button>
            <h1>Ingredient List</h1>
          </div>
          <ul className="ingredient-list">
            {ingredients.length === 0 ? (
              <li className="no-ingredients">No ingredients detected</li>
            ) : (
              ingredients.map((ingredient, index) => {
                if (!ingredient || !ingredient.ingredient_name || !ingredient.ingredient_type) {
                  return null;
                }
                const iconSrc = getIconForIngredientType(ingredient.ingredient_type);
                return (
                  <li key={`${ingredient.ingredient_name}-${index}`} className="ingredient-items">
                    <img src={iconSrc} alt={`${ingredient.ingredient_type} icon`} className="ingredient-icon" />
                    {editIndex === index ? (
                      <>
                        <input 
                          type="text" 
                          value={editedName} 
                          onChange={(e) => setEditedName(e.target.value)} 
                          className="ingredient-edit-input"
                        />
                        <button className="save-btn" onClick={() => handleSaveEdit(index)}>Save</button>
                        <button className="cancel-btn" onClick={handleCancelEdit}>Cancel</button>
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
              })
            )}
          </ul>
          
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