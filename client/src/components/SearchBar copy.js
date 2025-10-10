import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/SearchBar.css';  // Import the CSS file
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
import IconCamera from '../image/nav_icon/icon_camera.svg';

const SearchBar = () => {

    const navigate = useNavigate();
    const [activeImages, setActiveImages] = useState([bread, tomato, celery, pork]);
    const [selectedCuisine, setSelectedCuisine] = useState([]);
    const [selectedPreference, setSelectedPreference] = useState([]);
    const [selectedOccasion, setSelectedOccasion] = useState([]);
    const [searchText, setSearchText] = useState("");

    // Handle ingredient search
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchText.trim()) {
            // You can navigate or call API here
            navigate(`/search?ingredient=${encodeURIComponent(searchText.trim())}`);
        }
    };

    // Camera icon click handler
    const handleCameraClick = () => {
        navigate("/camera");
    };

    const toggleImage = (index) => {
        const newImages = [...activeImages];
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

    return (
        <div className="search-container">
            <div className="back-home">
                <img src={backicon} alt="back" className="back-icon" onClick={() => navigate("/home")} />
                <p className="back-text">Searching</p>
            </div>
            {/* Google-style search bar with camera icon */}
            <form className="search-bar-google" onSubmit={handleSearch}>
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
            {/* ...existing code... */}
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
            {/* ...existing code for cuisines, preferences, occasions, and search button... */}
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
            <div className="search-recipe-button">
                <p className="search-recipe-text">SEARCH FOR RECIPE</p>
            </div>
        </div>
    );

};
export default SearchBar;