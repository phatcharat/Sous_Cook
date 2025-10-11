import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    saveIngredientsToLocalStorage, 
    getIngredientsFromLocalStorage,
    getCameraIngredientsFromLocalStorage,
    getDeletedIngredients 
} from '../utils/storageUtils';
import '../css/SearchBar.css';
import backicon from '../image/searchbar/Back.svg';
import scanicon from '../image/searchbar/Scan.svg';
import bread from '../image/homepage/Bread.svg';
import tomato from '../image/homepage/Tomato.svg';
import celery from '../image/homepage/Celery.svg';
import pork from '../image/homepage/Pork.svg';
import breadclick from '../image/homepage/BreadClick.svg';
import tomatoclick from '../image/homepage/TomatoClick.svg';
import celeryclick from '../image/homepage/CeleryClick.svg';
import porkclick from '../image/homepage/PorkClick.svg';
import IconCamera from '../image/searchbar/Scan.svg';
import listicon from '../image/homepage/List.svg';

const SearchBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeImages, setActiveImages] = useState([bread, tomato, celery, pork]);
    const [selectedCuisine, setSelectedCuisine] = useState([]);
    const [selectedPreference, setSelectedPreference] = useState([]);
    const [selectedOccasion, setSelectedOccasion] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [allIngredients, setAllIngredients] = useState([]);
    const [showAddedMessage, setShowAddedMessage] = useState(false);

    // filter duplicate ingredient names
    const getUniqueIngredients = (ingredients) => {
        const seen = new Set();
        const deleted = getDeletedIngredients();
        return ingredients.filter(ing => {
            const name = ing.ingredient_name?.trim().toLowerCase();
            if (!name || seen.has(name) || deleted.includes(name)) return false;
            seen.add(name);
            return true;
        });
    };

    // Separate function to load ingredients
    const loadAllIngredients = () => {
        const manualIngredients = getIngredientsFromLocalStorage();
        const cameraIngredients = getCameraIngredientsFromLocalStorage();
        // filter duplicate names
        setAllIngredients(getUniqueIngredients([...manualIngredients, ...cameraIngredients]));
    };

    // Load all ingredients on component mount AND when returning from other pages
    useEffect(() => {
        loadAllIngredients();
    }, [location.key]); // Re-run when navigation occurs

    // Handle ingredient search
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchText.trim()) {
            const newIngredient = {
                ingredient_name: searchText.trim(),
                ingredient_type: "Other",
                source: "manual"
            };
            
            const updatedIngredients = [...selectedIngredients, newIngredient];
            setSelectedIngredients(updatedIngredients);
            setSearchText("");
            
            // Save to localStorage and update count
            const existingIngredients = getIngredientsFromLocalStorage();
            saveIngredientsToLocalStorage([...existingIngredients, newIngredient]);
            loadAllIngredients();

            // Show popup
            setShowAddedMessage(true);
            setTimeout(() => {
                setShowAddedMessage(false);
            }, 2000);
        }
    };

    // Camera icon click handler - navigate to CameraSearch
    const handleCameraClick = () => {
        navigate("/camera-search");
    };

    // Handle the main search for recipe button
    const handleSearchRecipe = () => {
        const existingIngredients = getIngredientsFromLocalStorage();
        const cameraIngredients = getCameraIngredientsFromLocalStorage();
        
        // Combine all ingredients
        const allIngredients = [
            ...existingIngredients,
            ...selectedIngredients,
            ...cameraIngredients
        ];
        
        // Save to localStorage
        saveIngredientsToLocalStorage(allIngredients);
        
        // Fix: Changed route from 'ingredients-preview' to 'ingredient-preview'
        navigate('/ingredient-preview');
    };

    const toggleImage = (index) => {
        const newImages = [...activeImages];
        const ingredientNames = ['Bread', 'Tomato', 'Celery', 'Pork'];
        const ingredientTypes = ['Grains, nuts, and baking products', 'Vegetables', 'Vegetables', 'Meat, sausages and fish'];
        
        switch (index) {
            case 0:
                newImages[0] = newImages[0] === bread ? breadclick : bread;
                break;
            case 1:
                newImages[1] = newImages[1] === tomato ? tomatoclick : tomato;
                break;
            case 2:
                newImages[2] = newImages[2] === celery ? celeryclick : celery;
                break;
            case 3:
                newImages[3] = newImages[3] === pork ? porkclick : pork;
                break;
            default:
                break;
        }
        setActiveImages(newImages);
        
        // Toggle ingredient selection
        const ingredientName = ingredientNames[index];
        const ingredientType = ingredientTypes[index];
        const isSelected = selectedIngredients.some(ing => ing.ingredient_name === ingredientName);
        
        if (isSelected) {
            // Remove ingredient
            setSelectedIngredients(selectedIngredients.filter(ing => ing.ingredient_name !== ingredientName));
        } else {
            // Add ingredient
            setSelectedIngredients([...selectedIngredients, {
                ingredient_name: ingredientName,
                ingredient_type: ingredientType,
                source: "manual"
            }]);
        }
    };

    const toggleSelection = (index, selectedArray, setSelectedArray) => {
        if (selectedArray.includes(index)) {
            setSelectedArray(selectedArray.filter(i => i !== index));
        } else {
            setSelectedArray([...selectedArray, index]);
        }
    };

    const cuisines = [
        "Southeast Asian",
        "American",
        "Italian",
        "Mexican",
        "Indian",
        "Fusion",
        "South American",
        "Middle Eastern",
        "Mediterranean"
    ];

    const preferences = [
        "Vegetarian",
        "Lactose Intolerance",
        "Pescatarian",
        "Gluten intolerance",
        "No red meat",
        "Diabetes",
        "Dairy-free",
        "Low carb",
        "High carb",
        "High protein",
        "Nuts Allergies",
        "Healthy"
    ];

    const occasions = [
        "Breakfast",
        "Lunch",
        "Dinner",
        "Snack",
        "Side Dish",
        "Party"
    ];

    // Update handleIngredientPreview to pass current state and refresh on return
    const handleIngredientPreview = () => {
        // Reload ingredients before navigating to ensure fresh data
        loadAllIngredients();
        
        // Combine current selected ingredients with stored ones
        const manualIngredients = getIngredientsFromLocalStorage();
        const cameraIngredients = getCameraIngredientsFromLocalStorage();
        
        // Create real-time ingredients list
        const currentIngredients = [
            ...selectedIngredients,
            ...manualIngredients,
            ...cameraIngredients
        ];
        
        navigate('/ingredient-preview', {
            state: { 
                currentIngredients,
                fromSearchBar: true 
            }
        });
    };

    return (
        <div className="search-container">
            <div className="back-home">
                <img src={backicon} alt="back" className="back-icon" onClick={() => navigate("/home")} />
                <p className="back-text">Searching</p>
            </div>
            {/* Google-style search bar with camera icon */}
            <form className="search-bar" onSubmit={handleSearch}>
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search for ingredients..."
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                />
                <button type="button" className="camera-icon-btn" onClick={handleCameraClick}>
                    <img src={IconCamera} alt="camera" className="camera-icon" />
                </button>
                <button type="submit" className="search-btn" style={{display: 'none'}}></button>
            </form>
            
            <div className="ingredients-container">
                <p className="ingredients-text">Ingredients</p>
                <div className="ingredients-scroll">
                    {activeImages.map((img, idx) => (
                        <img
                            key={idx}
                            src={img}
                            alt={`Ingredient ${idx}`}
                            onClick={() => toggleImage(idx)}
                            style={{ cursor: "pointer" }}
                        />
                    ))}
                </div>
            </div>
            
            <div className="cuisine-container">
                <p className="cuisine-text">Cuisines</p>
                <div className="cuisine-list">
                    {cuisines.map((item, index) => (
                        <div
                            key={index}
                            className={`cuisine-item ${selectedCuisine.includes(index) ? "active" : ""}`}
                            onClick={() => toggleSelection(index, selectedCuisine, setSelectedCuisine)}
                        >
                            {item}
                        </div>
                    ))}
                </div>
                <div className="divider"></div>
            </div>
            
            <div className="preference-container">
                <p className="preference-text">Dietary Preferences</p>
                <div className="preference-list">
                    {preferences.map((item, index) => (
                        <div
                            key={index}
                            className={`preferences-item ${selectedPreference.includes(index) ? "active" : ""}`}
                            onClick={() => toggleSelection(index, selectedPreference, setSelectedPreference)}
                        >
                            {item}
                        </div>
                    ))}
                </div>
                <div className="divider"></div>
            </div>
            
            <div className="occasion-container">
                <p className="occasion-text">Meal Occasions</p>
                <div className="occasion-list">
                    {occasions.map((item, index) => (
                        <div
                            key={index}
                            className={`occasion-item ${selectedOccasion.includes(index) ? "active" : ""}`}
                            onClick={() => toggleSelection(index, selectedOccasion, setSelectedOccasion)}
                        >
                            {item}
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="search-recipe-row">
                <div className="search-recipe-button" onClick={handleSearchRecipe}>
                    <p className="search-recipe-text">SEARCH FOR RECIPE</p>
                </div>
                <button 
                    className="list-icon-btn" 
                    onClick={handleIngredientPreview}
                >
                    <img src={listicon} alt="Ingredient List" />
                    {allIngredients.length > 0 && (
                        <span className="ingredient-count-badge">
                            {allIngredients.length}
                        </span>
                    )}
                </button>
            </div>

            {showAddedMessage && (
                <div className="ingredient-added-popup">
                    <p>Ingredient added.</p>
                </div>
            )}
        </div>
    );
};

export default SearchBar;