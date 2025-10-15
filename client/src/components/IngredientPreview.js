// IngredientPreview.js

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
<<<<<<< HEAD
<<<<<<< HEAD
import { saveIngredientsToLocalStorage, getIngredientsFromLocalStorage, addDeletedIngredient, getDeletedIngredients } from '../utils/storageUtils';
=======
import { saveIngredientsToLocalStorage, getIngredientsFromLocalStorage,getCameraIngredientsFromLocalStorage,saveCameraIngredientsToLocalStorage} from '../utils/storageUtils';
>>>>>>> refs/remotes/origin/main
=======
import { saveIngredientsToLocalStorage, getIngredientsFromLocalStorage,getCameraIngredientsFromLocalStorage,saveCameraIngredientsToLocalStorage} from '../utils/storageUtils';
>>>>>>> refs/remotes/origin/main
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
<<<<<<< HEAD
<<<<<<< HEAD
    const deleted = getDeletedIngredients();
    
    return ingredients.filter(ing => {
      if (!ing || typeof ing !== 'object') return false;
      const name = ing.ingredient_name?.trim();
      if (!name) return false;
      
      const nameLower = name.toLowerCase();
      if (seen.has(nameLower) || deleted.includes(nameLower)) {
        return false;
      }
      
      seen.add(nameLower);
=======
    return ingredients.filter(ing => {
      if (!ing || typeof ing !== 'object') return false;
=======
    return ingredients.filter(ing => {
      if (!ing || typeof ing !== 'object') return false;
>>>>>>> refs/remotes/origin/main
      const name = ing.ingredient_name?.trim().toLowerCase();
      if (!name || seen.has(name)) return false;
      seen.add(name);
>>>>>>> refs/remotes/origin/main
      return true;
    });
  };

<<<<<<< HEAD
<<<<<<< HEAD
  useEffect(() => {
    let allIngredients = location.state?.currentIngredients || getIngredientsFromLocalStorage();
    const uniqueIngredients = getUniqueIngredients(allIngredients);
    setIngredients(uniqueIngredients);
  }, [location.state]);
=======
=======
>>>>>>> refs/remotes/origin/main
useEffect(() => {
  const normalIngredients = getIngredientsFromLocalStorage();
  const cameraIngredients = getCameraIngredientsFromLocalStorage();
  const allIngredients = [...normalIngredients, ...cameraIngredients];
  const uniqueIngredients = getUniqueIngredients(allIngredients);
  setIngredients(uniqueIngredients);
}, []);
<<<<<<< HEAD
>>>>>>> refs/remotes/origin/main
=======
>>>>>>> refs/remotes/origin/main

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

<<<<<<< HEAD
<<<<<<< HEAD
  const handleNavigateWithSave = (path) => {
    saveIngredientsToLocalStorage(ingredients);
    navigate(path);
  };

  const handleAddIngredient = () => handleNavigateWithSave('/search');
  const handleBack = () => handleNavigateWithSave('/search');
=======
  const handleAddIngredient = () => navigate('/search');
  const handleBack = () => navigate('/search');
>>>>>>> refs/remotes/origin/main
=======
  const handleAddIngredient = () => navigate('/search');
  const handleBack = () => navigate('/search');
>>>>>>> refs/remotes/origin/main

  return (
    <>
      {isReferencePage ? (
        <PreferencesPage onBack={handleBackToIngredientPreview} />
      ) : (
        <div className="ingredient-preview-container">
          <div className='menu-header-container'>
            <button className="back-button" onClick={handleBack}>Ingredient List</button>
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
<<<<<<< HEAD
<<<<<<< HEAD
                  <li key={ingredient.ingredient_name} className="ingredient-items">
=======
                  <li key={`${ingredient.ingredient_name}-${index}`} className="ingredient-items">
>>>>>>> refs/remotes/origin/main
=======
                  <li key={`${ingredient.ingredient_name}-${index}`} className="ingredient-items">
>>>>>>> refs/remotes/origin/main
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
