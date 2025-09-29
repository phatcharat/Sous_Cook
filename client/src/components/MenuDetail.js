import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/MenuDetail.css'; 
import { getIngredientsFromLocalStorage, getImageFromLocalStorage, saveImageToLocalStorage } from '../utils/storageUtils';
import checkbox from '../image/menu-detail/Checkbox.svg';
import checkboxOncheck from '../image/menu-detail/Checkbox_check.svg';
import axios from 'axios';
import unkonwIngImage from '../image/ingredient/unknow-ingredient.svg';
import unkonwMenuImage from  '../image/menu-suggestion/notfound-image.svg';
import tips from '../image/menu-detail/tips.svg'

const MenuDetail = () => { 
    const navigate = useNavigate();
    const location = useLocation();
    const { menu, isRandomMenu = false } = location.state || {};
  
    const [checkedSteps, setCheckedSteps] = useState([]);
    const [ingredientImages, setIngredientImages] = useState({});
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [menuImage, setMenuImage] = useState(menu || {});
  
    const handleCheck = (index) => {
      if (checkedSteps.includes(index)) {
        setCheckedSteps(checkedSteps.filter(stepIndex => stepIndex !== index));
      } else {
        setCheckedSteps([...checkedSteps, index]);
      }
    };

    const handleBackNavigation = () => {
        if (isRandomMenu) {
            navigate('/home')
        } else {
            navigate('/menu-suggestion')
        }
    };

    // select object to shopping list
    const handleSelectIngredient = (ingredientName, quantity) => {
        setSelectedIngredients((prev) => {
            const alreadySelected = prev.find((item) => item.name === ingredientName);
            if (alreadySelected) {
                return prev.filter((item) => item.name !== ingredientName);
            } else {
                return [
                    ...prev,
                    {
                        name: ingredientName,
                        quantity,
                        image: ingredientImages[ingredientName] || unkonwIngImage,
                    },
                ];
            }
        });
    };

    useEffect(() => {
        if (!menu) {
            console.error("Menu is not available.");
            return;
        }

        if (!menu.ingredients_quantity || typeof menu.ingredients_quantity !== 'object') {
            console.error("Ingredients are not available or not an object.");
            console.log("menu.ingredients_quantity:", menu.ingredients_quantity);
            return;
        }

        const ingredientList = Object.keys(menu.ingredients_quantity);
        const menuList = [menu];
        let isCancelled = false;

        const fetchImages = async () => {
            setIsLoading(true);
            try {
                const images = await fetchMissingImages(menuList, ingredientList);
                if (!isCancelled) {
                    setIngredientImages(images.ingredient || {});

                    const foundMenu = images.menu.find(m => m.name === menu.menu_name);
                    if (foundMenu && foundMenu.image) {
                        setMenuImage(prev => ({ ...prev, image: foundMenu.image }));
                    }
                }
            } catch (error) {
                console.error('Error fetching images:', error);
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };

        fetchImages();

        // Cleanup function
        return () => {
            isCancelled = true;
        };
    }, [menu]);      

    if (!menu) {
        return (
            <div className="menu-detail-container">
                <p>No menu details available.</p>
                <button className="back-button" onClick={() => navigate('/menu-suggestion')}>← Back</button>
            </div>
        );
    }

    return (
        <div className="menu-detail-container">
            <div className='image-header'>
                <button className="back-button" onClick={handleBackNavigation}></button>
                <img
                    src={menuImage.image || unkonwMenuImage}
                    alt={menuImage.menu_name}
                    className="menu-image-large"
                />
            </div>

            <div className="text-container">
                <div className='menu-header'>
                    <h1>{menu.menu_name}</h1>
                    <p>Prep time: {menu.prep_time || 'N/A'}</p>
                    <p>Cooking time: {menu.cooking_time || 'N/A'}</p>
                </div>
                
                <div className='header'>
                    <h2>Ingredients</h2>
                </div>
                
                <div className="ingredients-container">
                    {menu.ingredients_quantity && Object.entries(menu.ingredients_quantity)
                        .filter(([ingredientName, _]) => {
                            const ingredientType = menu.ingredients_type?.[ingredientName];
                            return ingredientType && ingredientType !== 'Miscellaneous items';
                        })
                        .map(([ingredientName, quantity], idx) => (
                            <div 
                                key={idx} 
                                className={`ingredient-item ${
                                    selectedIngredients.some((item) => item.name === ingredientName)
                                        ? "selected"
                                        : ""
                                }`}
                                onClick={() => handleSelectIngredient(ingredientName, quantity)}
                            >
                                <img
                                    src={ingredientImages[ingredientName] || unkonwIngImage}
                                    alt={ingredientName}
                                    className="ingredient-image"
                                    style={{ 
                                        objectFit: ingredientImages[ingredientName] ? "contain" : "scale-down", 
                                    }} 
                                />
                                <p className='header'>{ingredientName}</p>
                                <p>{quantity}</p>
                            </div>
                        ))}
                </div>

                <div className='header'>
                    <h2>Seasoning/Dressing</h2>
                </div>

                <div className="seasoning-container">
                    {menu.ingredients_quantity && Object.entries(menu.ingredients_quantity)
                        .filter(([ingredientName, _]) => {
                            const ingredientType = menu.ingredients_type?.[ingredientName];
                            return ingredientType && ingredientType === 'Miscellaneous items';
                        })
                        .map(([ingredientName, quantity], idx) => (
                            <div 
                                key={idx} 
                                className={`ingredient-item ${
                                    selectedIngredients.some((item) => item.name === ingredientName)
                                        ? "selected"
                                        : ""
                                }`}
                                onClick={() => handleSelectIngredient(ingredientName, quantity)}
                            >
                                <img
                                    src={ingredientImages[ingredientName] || unkonwIngImage}
                                    alt={ingredientName}
                                    className="ingredient-image"
                                    style={{ 
                                        objectFit: ingredientImages[ingredientName] ? "contain" : "scale-down", 
                                    }} 
                                />
                                <p className='header'>{ingredientName}</p>
                                <p>{quantity}</p>
                            </div>
                        ))}
                </div>

                <div className="missing-ingredients">
                    <p className="missing-text">Missing some ingredients?</p>
                    <button
                        className="add-to-list-button"
                        onClick={() =>
                            navigate("/shoppinglist", {
                                state: { missingIngredients: selectedIngredients },
                            })
                        }
                        disabled={selectedIngredients.length === 0}
                    >
                        Add to list
                    </button>
                </div>

                <div className='spliteline'></div>
                
                <div className='header'>
                    <h2>Instructions</h2>
                </div>
                
                <ul className="instructions-list">
                    {menu.steps && menu.steps.map((step, idx) => (
                        <li key={idx} className={checkedSteps.includes(idx) ? 'checked-step' : ''}>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={checkedSteps.includes(idx)}
                                    onChange={() => handleCheck(idx)}
                                    className="custom-checkbox"
                                />
                                <span className="custom-checkbox-styled">
                                    <img 
                                        src={checkedSteps.includes(idx) ? checkboxOncheck : checkbox} 
                                        alt="Checkbox" 
                                    />
                                </span>
                                {step}
                            </label>
                        </li>
                    ))}
                </ul>

                <div className='header'>
                    <h2>Tips</h2>
                </div>
                
                <div className="tips-container">
                    {menu.tips && menu.tips.length > 0 ? (
                        <ul>
                        {menu.tips.map((tip, idx) => (
                            <li key={idx}>{tip}</li>
                        ))}
                        </ul>
                    ) : (
                        <p>No tips available.</p>
                    )}
                </div>

                <div className='header'>
                    <h2>Nutrition (per serving)</h2>
                </div>

                <div className="nutrition-container">
                    {menu.nutrition ? (
                        <ul>
                        <li>Calories: {menu.nutrition.calories || 'N/A'}</li>
                        <li>Protein: {menu.nutrition.protein || 'N/A'}</li>
                        <li>Fat: {menu.nutrition.fat || 'N/A'}</li>
                        <li>Carbohydrates: {menu.nutrition.carbohydrates || 'N/A'}</li>
                        <li>Sodium: {menu.nutrition.sodium || 'N/A'}</li>
                        <li>Sugar: {menu.nutrition.sugar || 'N/A'}</li>
                        </ul>
                    ) : (
                        <p>No nutrition data available.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const fetchMissingImages = async (menuList, ingredientList) => {
    let storedImages = getImageFromLocalStorage();

    // Initialize with proper structure if not exists
    if (!storedImages || typeof storedImages !== 'object') {
        storedImages = { menu: [], ingredient: {} };
    }

    if (!Array.isArray(storedImages.menu)) {
        storedImages.menu = [];
    }

    if (!storedImages.ingredient || typeof storedImages.ingredient !== 'object') {
        storedImages.ingredient = {};
    }

    const missingMenuItems = menuList.filter(menuItem => 
        !storedImages.menu.some(storedMenu => storedMenu.name === menuItem.menu_name)
    );

    const missingIngredients = ingredientList.filter(ingredient => 
        !(ingredient in storedImages.ingredient)
    );

    console.log("missingMenuItems:", missingMenuItems);
    console.log("missingIngredients:", missingIngredients);

    if (missingMenuItems.length > 0 || missingIngredients.length > 0) {
        try {
            // Fetch menu images
            const fetchedMenus = await Promise.all(
                missingMenuItems.map(async (item) => {
                    try {
                        const response = await axios.get(
                            `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(item.menu_name)}`
                        );
                        const data = response.data;
                        if (data.meals && data.meals.length > 0) {
                            return {
                                name: item.menu_name,
                                image: data.meals[0].strMealThumb,
                            };
                        } else {
                            return { name: item.menu_name, image: "" };
                        }
                    } catch (err) {
                        console.error(`Error fetching image for ${item.menu_name}:`, err);
                        return { name: item.menu_name, image: "" };
                    }
                })
            );

            // Fetch ingredient images from your backend
            let fetchedIngredients = [];
            if (missingIngredients.length > 0) {
                try {
                    const response = await axios.post('/api/get_ingredient_image', {
                        ingredients: missingIngredients
                    });
                    fetchedIngredients = response.data || [];
                } catch (err) {
                    console.error('Error fetching ingredient images:', err);
                    // Create default entries for missing ingredients
                    fetchedIngredients = missingIngredients.map(ingredient => ({
                        ingredient,
                        imageUrl: null
                    }));
                }
            }

            const newImages = {
                menu: [...storedImages.menu, ...fetchedMenus],
                ingredient: { 
                    ...storedImages.ingredient, 
                    ...Object.fromEntries(
                        fetchedIngredients.map(item => [item.ingredient, item.imageUrl])
                    ) 
                },
            };

            saveImageToLocalStorage(newImages);
            return newImages;
        } catch (error) {
            console.error('Error fetching images:', error);
            return storedImages;
        }
    }

    return storedImages;
};

export default MenuDetail;