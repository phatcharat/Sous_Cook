import React, { useState, useEffect } from 'react';
import { getIngredientsFromLocalStorage, savePreferencesToLocalStorage, getPreferencesFromLocalStorage,saveMenuToLocalStorage,printData } from '../utils/storageUtils';
import '../css/PreferencesPage.css';
import { useNavigate } from 'react-router-dom'; 

const PreferencesPage = () => {
    const [selectedCuisines, setSelectedCuisines] = useState([]);
    const [selectedDietaryPreferences, setSelectedDietaryPreferences] = useState([]);
    const [selectedMealOccasions, setSelectedMealOccasions] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // Loading state
    const navigate = useNavigate();
  
    // Load stored preferences and ingredients on component mount
    useEffect(() => {
    const storedPreferences = getPreferencesFromLocalStorage();
    if (storedPreferences) {
        setSelectedCuisines(storedPreferences.cuisines || []);
        setSelectedDietaryPreferences(storedPreferences.dietaryPreferences || []);
        setSelectedMealOccasions(storedPreferences.mealOccasions || []);
    }

    const storedIngredients = getIngredientsFromLocalStorage();
    setIngredients(storedIngredients || []);
    }, []);

    // Save preferences to local storage whenever a selection is made
    useEffect(() => {
        const preferences = {
            cuisines: selectedCuisines,
            dietaryPreferences: selectedDietaryPreferences,
            mealOccasions: selectedMealOccasions,
        };
    savePreferencesToLocalStorage(preferences);
    }, [selectedCuisines, selectedDietaryPreferences, selectedMealOccasions]);

    const cuisines = ['Southeast Asian', 'American', 'Italian', 'Mexican', 'Indian', 'Fusion', 'South American', 'Middle Eastern', 'Mediterranean'];
    const dietaryPreferences = ['Vegetarian', 'Lactose Intolerance', 'Pescatarian', 'Gluten intolerance', 'No red meat', 'Keto', 'Diabetes', 'Dairy-free', 'Low carb', 'High carb', 'High protein', 'Nuts Allergies', 'Healthy'];
    const mealOccasions = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Side Dish', 'Party'];

    const toggleSelection = (item, setSelection, selectedItems) => {
    setSelection(prevState =>
        prevState.includes(item)
        ? prevState.filter(selected => selected !== item)
        : [...prevState, item]
        );
    };

    const handleConfirm = async () => {
        const ingredientNames = ingredients
          .filter((i) => i && i.ingredient_name)
          .map((i) => i.ingredient_name);
      
        console.log('Ingredient names being sent:', ingredientNames);
        try {
          setIsLoading(true);
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/menu-recommendations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ingredients: ingredientNames, 
              cuisines: selectedCuisines,
              dietaryPreferences: selectedDietaryPreferences,
              mealOccasions: selectedMealOccasions,
            }),
          });
      
          const data = await response.json();
          console.log('Menu recommendations:', data);
      
          // Save the menu recommendations to local storage
          saveMenuToLocalStorage(data.recommendations);
          printData('menus');
          setIsLoading(false);
          navigate('/menu-suggestion')
        } catch (error) {
          console.error('Error getting menu recommendations:', error);
          setIsLoading(false);
        }
      };
      
    

    return (
    <>
    {isLoading && <LoadingMenuPage />}
    <div className="preferences-container">
        <div className='menu-header-container'>
            <button className="back-button" onClick={()=>navigate('/ingredient-preview')}></button>
            <h1 className="header">Cuisines</h1>
        </div>
        <div className="preference-list">
        {cuisines.map(cuisine => (
            <button
            key={cuisine}
            className={`preference-item ${selectedCuisines.includes(cuisine) ? 'selected' : ''}`}
            onClick={() => toggleSelection(cuisine, setSelectedCuisines, selectedCuisines)}
            >
            {cuisine}
            </button>
        ))}
        </div>

        <div className='spliteline'></div>

        <h1 className="header">Dietary Preferences <span className="permanent-filter">(This filter is permanent)</span></h1>
        <div className="preference-list">
        {dietaryPreferences.map(preference => (
            <button
            key={preference}
            className={`preference-item ${selectedDietaryPreferences.includes(preference) ? 'selected' : ''}`}
            onClick={() => toggleSelection(preference, setSelectedDietaryPreferences, selectedDietaryPreferences)}
            >
            {preference}
            </button>
        ))}
        </div>

        <div className='spliteline'></div>

        <h1 className="header">Meal Occasions</h1>
        <div className="preference-list">
        {mealOccasions.map(occasion => (
            <button
            key={occasion}
            className={`preference-item ${selectedMealOccasions.includes(occasion) ? 'selected' : ''}`}
            onClick={() => toggleSelection(occasion, setSelectedMealOccasions, selectedMealOccasions)}
            >
            {occasion}
            </button>
        ))}
        </div>

        <button className="search-button" onClick={handleConfirm}>SEARCH FOR RECIPE</button>
    </div>
    </>
    );
    };
    const LoadingMenuPage = () => {
    return (
        <div className="loading-overlay">
        <div className="loading-popup">
            <div className="spinner"></div>
            <p>Creating your menu, just a moment!</p>
        </div>
        </div>
    );
};
export default PreferencesPage;
