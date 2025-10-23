import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    saveIngredientsToLocalStorage,
    getIngredientsFromLocalStorage,
    getCameraIngredientsFromLocalStorage
} from '../utils/storageUtils';
import '../css/SearchBar.css';
import searchicon from '../image/homepage/Search-Icon.svg'
import backicon from '../image/searchbar/Back.svg';
import bread from '../image/homepage/Bread.svg';
import tomato from '../image/homepage/Tomato.svg';
import celery from '../image/homepage/Celery.svg';
import pork from '../image/homepage/Pork.svg';
import shrimp from '../image/homepage/Shrimp.svg';
import shrimpclick from '../image/homepage/ShrimpClick.svg';
import breadclick from '../image/homepage/BreadClick.svg';
import tomatoclick from '../image/homepage/TomatoClick.svg';
import celeryclick from '../image/homepage/CeleryClick.svg';
import porkclick from '../image/homepage/PorkClick.svg';
import IconCamera from '../image/searchbar/camera.png';
import listicon from '../image/homepage/List.svg';
import logo from '../image/Logo1.svg';
import textlogo from '../image/TextLogo.svg';

const SearchBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeImages, setActiveImages] = useState([bread, tomato, celery, pork, shrimp]);
    const [searchText, setSearchText] = useState("");
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [allIngredients, setAllIngredients] = useState([]);
    const [showAddedMessage, setShowAddedMessage] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);

    // รายการวัตถุดิบแนะนำ (สามารถเพิ่มเติมได้)
    const ingredientSuggestions = [
        { name: 'Bread', type: 'Grains, nuts, and baking products' },
        { name: 'Tomato', type: 'Vegetables' },
        { name: 'Celery', type: 'Vegetables' },
        { name: 'Pork', type: 'Meat, sausages and fish' },
        { name: 'Shrimp', type: 'Meat, sausages and fish' },
        { name: 'Chicken', type: 'Meat, sausages and fish' },
        { name: 'Beef', type: 'Meat, sausages and fish' },
        { name: 'Fish', type: 'Meat, sausages and fish' },
        { name: 'Egg', type: 'Eggs' },
        { name: 'Milk', type: 'Milk and dairy products' },
        { name: 'Cheese', type: 'Milk and dairy products' },
        { name: 'Butter', type: 'Milk and dairy products' },
        { name: 'Rice', type: 'Grains, nuts, and baking products' },
        { name: 'Pasta', type: 'Grains, nuts, and baking products' },
        { name: 'Flour', type: 'Grains, nuts, and baking products' },
        { name: 'Onion', type: 'Vegetables' },
        { name: 'Garlic', type: 'Vegetables' },
        { name: 'Carrot', type: 'Vegetables' },
        { name: 'Potato', type: 'Vegetables' },
        { name: 'Mushroom', type: 'Vegetables' },
        { name: 'Broccoli', type: 'Vegetables' },
        { name: 'Spinach', type: 'Vegetables' },
        { name: 'Lettuce', type: 'Vegetables' },
        { name: 'Cucumber', type: 'Vegetables' },
        { name: 'Bell Pepper', type: 'Vegetables' },
        { name: 'Apple', type: 'Fruit' },
        { name: 'Banana', type: 'Fruit' },
        { name: 'Orange', type: 'Fruit' },
        { name: 'Lemon', type: 'Fruit' },
        { name: 'Strawberry', type: 'Fruit' },
        { name: 'Salt', type: 'Seasoning' },
        { name: 'Pepper', type: 'Seasoning' },
        { name: 'Sugar', type: 'Seasoning' },
        { name: 'Olive Oil', type: 'Oil and fat' },
        { name: 'Soy Sauce', type: 'Seasoning' }
    ];

    // filter duplicate ingredient names
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

    // Separate function to load ingredients
    const loadAllIngredients = () => {
        const manualIngredients = getIngredientsFromLocalStorage();
        const cameraIngredients = getCameraIngredientsFromLocalStorage();
        setAllIngredients(getUniqueIngredients([...manualIngredients, ...cameraIngredients]));
    };

    useEffect(() => {
        loadAllIngredients();
    }, [location.key]);

    // Handle ingredient search
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchText.trim()) {
            addIngredient(searchText.trim());
        }
    };

    // ฟังก์ชันสำหรับเพิ่มวัตถุดิบ
    const addIngredient = (ingredientName) => {
        const suggestion = ingredientSuggestions.find(
            s => s.name.toLowerCase() === ingredientName.toLowerCase()
        );

        const newIngredient = {
            ingredient_name: ingredientName,
            ingredient_type: suggestion ? suggestion.type : "Other",
            source: "manual"
        };

        setSelectedIngredients([...selectedIngredients, newIngredient]);
        setSearchText("");
        setShowSuggestions(false);

        const existingIngredients = getIngredientsFromLocalStorage();
        saveIngredientsToLocalStorage([...existingIngredients, newIngredient]);
        loadAllIngredients();

        setShowAddedMessage(true);
        setTimeout(() => {
            setShowAddedMessage(false);
        }, 2000);
    };

    // Handle input change และกรองคำแนะนำ
    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchText(value);

        if (value.trim().length > 0) {
            const filtered = ingredientSuggestions.filter(suggestion =>
                suggestion.name.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setShowSuggestions(false);
            setFilteredSuggestions([]);
        }
    };

    // Handle click suggestion
    const handleSuggestionClick = (suggestion) => {
        addIngredient(suggestion.name);
    };

    const handleCameraClick = () => {
        navigate("/camera-search");
    };

    const handleSearchRecipe = () => {
        const existingIngredients = getIngredientsFromLocalStorage();
        const cameraIngredients = getCameraIngredientsFromLocalStorage();

        const allIngredients = [
            ...existingIngredients,
            ...selectedIngredients,
            ...cameraIngredients
        ];

        saveIngredientsToLocalStorage(allIngredients);
        navigate('/ingredient-preview');
    };

    const toggleImage = (index) => {
        const newImages = [...activeImages];
        const ingredientNames = ['Bread', 'Tomato', 'Celery', 'Pork', 'Shrimp'];
        const ingredientTypes = ['Grains, nuts, and baking products', 'Vegetables', 'Vegetables', 'Meat, sausages and fish', 'Meat, sausages and fish'];

        const ingredientName = ingredientNames[index];
        const ingredientType = ingredientTypes[index];

        const isSelected = selectedIngredients.some(ing => ing.ingredient_name === ingredientName);

        if (isSelected) {
            // ลบ ingredient ออกจาก selectedIngredients
            const updatedSelected = selectedIngredients.filter(ing => ing.ingredient_name !== ingredientName);
            setSelectedIngredients(updatedSelected);

            // ลบ ingredient จาก localStorage
            const manualIngredients = getIngredientsFromLocalStorage().filter(ing => ing.ingredient_name !== ingredientName);
            saveIngredientsToLocalStorage(manualIngredients);

            // เปลี่ยนรูปกลับไปเป็นปกติ
            switch (index) {
                case 0: newImages[0] = bread; break;
                case 1: newImages[1] = tomato; break;
                case 2: newImages[2] = celery; break;
                case 3: newImages[3] = pork; break;
                case 4: newImages[4] = shrimp; break;
            }
        } else {
            // เพิ่ม ingredient ไปยัง selectedIngredients
            const newIngredient = {
                ingredient_name: ingredientName,
                ingredient_type: ingredientType,
                source: "manual"
            };
            const updatedSelected = [...selectedIngredients, newIngredient];
            setSelectedIngredients(updatedSelected);

            // เพิ่ม ingredient ลง localStorage
            const manualIngredients = getIngredientsFromLocalStorage();
            saveIngredientsToLocalStorage([...manualIngredients, newIngredient]);

            // เปลี่ยนรูปเป็น clicked
            switch (index) {
                case 0: newImages[0] = breadclick; break;
                case 1: newImages[1] = tomatoclick; break;
                case 2: newImages[2] = celeryclick; break;
                case 3: newImages[3] = porkclick; break;
                case 4: newImages[4] = shrimpclick; break;
            }
        }

        setActiveImages(newImages);
        loadAllIngredients();
    };

    const handleIngredientPreview = () => {
        loadAllIngredients();
        const manualIngredients = getIngredientsFromLocalStorage();
        const cameraIngredients = getCameraIngredientsFromLocalStorage();

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
                <button className="back-button" onClick={() => navigate("/home")}></button>
                <h1>Searching</h1>
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

            <div className="logo-section">
                <img src={logo} alt="Logo Icon" className="main-logo" />
                <img src={textlogo} alt="Text Logo" className="text-logo" />
            </div>

            <form className="search-bar" onSubmit={handleSearch}>
                <img src={searchicon} alt="search" className="search-icon" />
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search for ingredients..."
                    value={searchText}
                    onChange={handleInputChange}
                    onFocus={() => searchText.trim() && setShowSuggestions(filteredSuggestions.length > 0)}
                />
                <button type="button" className="camera-icon-btn" onClick={handleCameraClick}>
                    <img src={IconCamera} alt="camera" className="camera-icon" />
                </button>
                <button type="submit" className="search-btn" style={{ display: 'none' }}></button>

                {/* Dropdown Suggestions */}
                {showSuggestions && (
                    <div className="suggestions-dropdown">
                        {filteredSuggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                className="suggestion-item"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                <span className="suggestion-name">{suggestion.name}</span>
                                <span className="suggestion-type">{suggestion.type}</span>
                            </div>
                        ))}
                    </div>
                )}
            </form>

            <div className="ingredients-container">
                <p className="ingredients-text">Recommended ingredients</p>
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

            <div className="divider"></div>

            <div className="search-recipe-row">
                <div className="search-recipe-button" onClick={handleSearchRecipe}>
                    <p className="search-recipe-text">SEARCH FOR RECIPE</p>
                </div>
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
