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

const SearchBar = () => {
    const navigate = useNavigate();
    const [activeImages, setActiveImages] = useState([bread, tomato, celery, pork]);
    const [selectedCuisine, setSelectedCuisine] = useState(null);
    const [selectedPreference, setSelectedPreference] = useState(null);
    const [selectedOccasion, setSelectedOccasion] = useState(null);

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
            <div className="scan-box" onClick={() => navigate("/camera")}>
                <img src={scanicon} alt="scan" className="scan-icon" />
                <p className="scan-text">Scan and identify ingredient</p>
            </div>
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
                            className={`cuisine-item ${selectedCuisine === index ? "active" : ""}`}
                            onClick={() => setSelectedCuisine(selectedCuisine === index ? null : index)}
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
                            className={`preferences-item ${selectedPreference === index ? "active" : ""}`}
                            onClick={() => setSelectedPreference(selectedPreference === index ? null : index)}
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
                            className={`occasion-item ${selectedOccasion === index ? "active" : ""}`}
                            onClick={() => setSelectedOccasion(selectedOccasion === index ? null : index)}
                        >
                            {item}
                        </div>
                    ))}
                </div>
            </div>
            <dic className="search-recipe-button">
                <p className="search-recipe-text">SEARCH FOR RECIPE</p>
            </dic>
        </div>
    );

};
export default SearchBar;