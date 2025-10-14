import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/MenuDetail.css';
import { getIngredientsFromLocalStorage, getImageFromLocalStorage, saveImageToLocalStorage, saveShoppingListToStorage, getShoppingListFromStorage } from '../utils/storageUtils';
import checkbox from '../image/menu-detail/Checkbox.svg';
import checkboxOncheck from '../image/menu-detail/Checkbox_check.svg';
import axios from 'axios';
import unknowIngImage from '../image/ingredient/unknow-ingredient.svg';
import unknowMenuImage from '../image/menu-suggestion/notfound-image.svg';
import tips from '../image/menu-detail/tips.svg'
import { getUserId } from '../utils/auth';
import favorite from '../image/menu-detail/heart-filled.svg';
import notfavorite from '../image/menu-detail/heart-outline.svg';

const MenuDetail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { menu, menu_id, isRandomMenu = false } = location.state || {};

    const [menuData, setMenuData] = useState(menu || null);
    const [checkedSteps, setCheckedSteps] = useState([]);
    const [ingredientImages, setIngredientImages] = useState({});
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [mealCompleted, setMealCompleted] = useState(false);

    // Add new state for allergies and alerts
    const [userAllergies, setUserAllergies] = useState([]);
    const [allergyAlerts, setAllergyAlerts] = useState([]);
    const [showAllergyAlert, setShowAllergyAlert] = useState(false);
    const [hasAcknowledgedAllergy, setHasAcknowledgedAllergy] = useState(false);

    const actualMenuId = menu_id || menuData?.menu_id;

    // ย้อนกลับไปหน้าก่อนหน้าเสมอ
    const handleBackNavigation = () => {
        navigate(-1);
    };

    const handleCheck = async (index) => {
        let newCheckedSteps;

        if (checkedSteps.includes(index)) {
            newCheckedSteps = checkedSteps.filter(stepIndex => stepIndex !== index);
        } else {
            newCheckedSteps = [...checkedSteps, index];
        }

        setCheckedSteps(newCheckedSteps);

        // Check if all steps are now checked
        const totalSteps = menuData.steps?.length || 0;
        if (newCheckedSteps.length === totalSteps && totalSteps > 0 && !mealCompleted) {
            // All steps completed! Save to database
            const userId = getUserId();
            if (userId && actualMenuId) {
                try {
                    await axios.post(`${process.env.REACT_APP_BACKEND_URL}/meal-completions`, {
                        user_id: userId,
                        menu_id: actualMenuId
                    });

                    setMealCompleted(true);
                    console.log('Congratulations! Meal completed!');

                } catch (err) {
                    console.error('Error saving meal completion:', err);
                }
            }
        }
    };

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
                        image: ingredientImages[ingredientName] || unknowIngImage,
                    },
                ];
            }
        });
    };

    const handleToggleFavorite = async () => {
        const userId = getUserId();
        if (!userId || !actualMenuId) {
            console.error("Missing userId or menu_id for favorite");
            return;
        }

        try {
            if (isFavorite) {
                await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/favorites`, {
                    data: { user_id: userId, menu_id: actualMenuId }
                });
                setIsFavorite(false);
            } else {
                await axios.post(`${process.env.REACT_APP_BACKEND_URL}/favorites`, {
                    user_id: userId,
                    menu_id: actualMenuId
                });
                setIsFavorite(true);
            }
        } catch (err) {
            console.error("Error toggling favorite:", err);
        }
    };

    // Fetch user allergies with useCallback to prevent infinite loops
    const fetchUserAllergies = useCallback(async () => {
        const userId = getUserId();
        if (!userId) return;

        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/users/${userId}`);
            const allergies = response.data.user.allergies || [];
            setUserAllergies(allergies.map(a => a.toLowerCase()));
        } catch (error) {
            console.error('Error fetching user allergies:', error);
        }
    }, []);

    // Check allergies with GPT analysis
    const checkAllergies = useCallback(async () => {
        if (!menuData?.ingredients_quantity || userAllergies.length === 0) return;

        try {
            const ingredients = Object.keys(menuData.ingredients_quantity);
            
            // Call the backend to analyze allergies using GPT
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/analyze-allergies`,
                {
                    ingredients: ingredients,
                    allergies: userAllergies
                }
            );

            const { alerts } = response.data;

            if (alerts && alerts.length > 0 && !hasAcknowledgedAllergy) {
                setAllergyAlerts(alerts);
                setShowAllergyAlert(true);
            }
        } catch (error) {
            console.error('Error checking allergies:', error);
            
            // Fallback to simple string matching if API fails
            const alerts = [];
            Object.keys(menuData.ingredients_quantity).forEach(ingredient => {
                const ingredientLower = ingredient.toLowerCase();
                if (userAllergies.some(allergy => ingredientLower.includes(allergy.toLowerCase()))) {
                    alerts.push(ingredient);
                }
            });

            if (alerts.length > 0 && !hasAcknowledgedAllergy) {
                setAllergyAlerts(alerts);
                setShowAllergyAlert(true);
            }
        }
    }, [menuData, userAllergies, hasAcknowledgedAllergy]);

    const handleAllergyAcknowledge = () => {
        setShowAllergyAlert(false);
        setHasAcknowledgedAllergy(true);
    };

    // Fetch allergies once on mount
    useEffect(() => {
        fetchUserAllergies();
    }, [fetchUserAllergies]);

    // Check allergies when menuData or userAllergies change
    useEffect(() => {
        checkAllergies();
    }, [checkAllergies]);

    // ถ้ามาจาก History ให้ fetch menu จาก DB
    useEffect(() => {
        if (!menuData && menu_id) {
            console.log("Fetching menu by ID:", menu_id);
            axios.get(`${process.env.REACT_APP_BACKEND_URL}/menus/${menu_id}`)
                .then(res => {
                    console.log("Menu fetched:", res.data);
                    setMenuData(res.data);
                })
                .catch(err => console.error("Error fetching menu by ID:", err));
        }
    }, [menu_id, menuData]);

    // โหลดรูป ingredient และ menu
    useEffect(() => {
        if (!menuData || !menuData.ingredients_quantity) return;

        const ingredientList = Object.keys(menuData.ingredients_quantity);
        const menuList = [menuData];
        let isCancelled = false;

        const fetchImages = async () => {
            setIsLoading(true);
            try {
                const images = await fetchMissingImages(menuList, ingredientList);
                if (!isCancelled) {
                    setIngredientImages(images.ingredient || {});
                    const foundMenu = images.menu.find(m => m.menu_name === menuData.menu_name);
                    if (foundMenu && foundMenu.image) {
                        setMenuData(prev => ({ ...prev, image: foundMenu.image }));
                    }
                }
            } catch (error) {
                console.error('Error fetching images:', error);
            } finally {
                if (!isCancelled) setIsLoading(false);
            }
        };

        fetchImages();
        return () => { isCancelled = true; };
    }, [menuData?.menu_name]); // Only depend on menu_name to prevent infinite loop

    // save history
    useEffect(() => {
        if (!actualMenuId) return;

        const userId = getUserId();
        if (!userId) return;

        console.log("Saving to history - userId:", userId, "menu_id:", actualMenuId);

        axios.post(`${process.env.REACT_APP_BACKEND_URL}/history`, {
            user_id: userId,
            menu_id: actualMenuId
        })
            .then(res => {
                console.log("History saved successfully:", res.data);
            })
            .catch(err => {
                console.error("Error saving history:", err.response?.data || err.message);
            });
    }, [actualMenuId]);

    // check favorite
    useEffect(() => {
        const checkFavorite = async () => {
            const userId = getUserId();
            if (!userId || !actualMenuId) return;

            try {
                const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/favorites/${userId}`);
                const favIds = res.data.map(item => item.menu_id);
                const isInFavorites = favIds.includes(actualMenuId);
                setIsFavorite(isInFavorites);
            } catch (err) {
                console.error("Error fetching favorites:", err);
            }
        };

        checkFavorite();
    }, [actualMenuId]);

    // Fetch allergies once on mount
    useEffect(() => {
        fetchUserAllergies();
    }, [fetchUserAllergies]);

    // Check allergies when menuData or userAllergies change
    useEffect(() => {
        checkAllergies();
    }, [checkAllergies]);

    const handleAddToList = () => {
        const userId = getUserId();
        if (!userId) {
            navigate('/login');
            return;
        }

        if (selectedIngredients.length > 0) {
            const currentList = getShoppingListFromStorage(userId);
            const updatedList = [...currentList, ...selectedIngredients];
            saveShoppingListToStorage(userId, updatedList);
            
            navigate("/shoppinglist", {
                state: { missingIngredients: selectedIngredients }
            });
        }
    };

    if (!menuData) {
        return (
            <div className="menu-detail-container">
                <p>Loading menu details...</p>
                <button className="back-button" onClick={handleBackNavigation}>← Back</button>
            </div>
        );
    }

    return (
        <div className="menu-detail-container">
            <div className='image-header'>
                <button className="back-button" onClick={handleBackNavigation}></button>

                <button className="favorite-button" onClick={handleToggleFavorite}>
                    <img
                        src={isFavorite ? favorite : notfavorite}
                        alt="Favorite"
                    />
                </button>

                <img
                    src={menuData.image || unknowMenuImage}
                    alt={menuData.menu_name}
                    className="menu-image-large"
                />
            </div>

            {showAllergyAlert && allergyAlerts.length > 0 && (
                <div className="allergy-popup-overlay">
                    <div className="allergy-popup">
                        <div className="allergy-popup-content">
                            <h2>⚠️ Food Allergy Alert</h2>
                            <p>This recipe contains:</p>
                            <ul className="allergy-list">
                                {allergyAlerts.map((ingredient, index) => (
                                    <li key={index}><strong>{ingredient}</strong></li>
                                ))}
                            </ul>
                            <button 
                                className="allergy-confirm-btn"
                                onClick={handleAllergyAcknowledge}
                            >
                                I Understand
                            </button>
                        </div>
                    </div>
                </div>
            )}


            <div className="text-container">
                <div className='menu-header'>
                    <h1>{menuData.menu_name}</h1>
                    <p>Prep time: {menuData.prep_time || 'N/A'}</p>
                    <p>Cooking time: {menuData.cooking_time || 'N/A'}</p>
                </div>

                <h2>Ingredients</h2>
                <div className="ingredientAndSeasoning-container">
                    {menuData.ingredients_quantity && Object.entries(menuData.ingredients_quantity)
                        .filter(([name]) => {
                            const type = menuData.ingredients_type?.[name];
                            return type && type.toLowerCase() !== 'miscellaneous items';
                        })
                        .map(([name, quantity], idx) => (
                            <div
                                key={idx}
                                className={`ingredient-item${selectedIngredients.some(i => i.name === name) ? ' selected' : ''}`}
                                onClick={() => handleSelectIngredient(name, quantity)}
                            >
                                <img
                                    src={ingredientImages[name] || unknowIngImage}
                                    alt={name}
                                    className="ingredients-image"
                                />
                                <p className='header' title={name}>{name}</p>
                                <p>{abbreviateUnit(quantity)}</p>
                            </div>
                        ))}
                </div>

                <h2>Seasoning/Dressing</h2>
                <div className="ingredientAndSeasoning-container">
                    {menuData.ingredients_quantity && Object.entries(menuData.ingredients_quantity)
                        .filter(([name]) => {
                            const type = menuData.ingredients_type?.[name];
                            return type && type.toLowerCase() === 'miscellaneous items';
                        })
                        .map(([name, quantity], idx) => (
                            <div
                                key={idx}
                                className={`ingredient-item${selectedIngredients.some(i => i.name === name) ? ' selected' : ''}`}
                                onClick={() => handleSelectIngredient(name, quantity)}
                            >
                                <img
                                    src={ingredientImages[name] || unknowIngImage}
                                    alt={name}
                                    className="ingredients-image"
                                />
                                <p className='header' title={name}>{name}</p>
                                <p>{abbreviateUnit(quantity)}</p>
                            </div>
                        ))}
                </div>

                <div className="missing-ingredients">
                    <p className="missing-text">Missing some ingredients?</p>
                    <button
                        className="add-to-list-button"
                        onClick={handleAddToList}
                        disabled={selectedIngredients.length === 0}
                    >
                        Add to list
                    </button>
                </div>

                <h2>Instructions</h2>
                <ul className="instructions-list">
                    {menuData.steps?.map((step, idx) => (
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

                <h2>Tips</h2>
                <div className="tips-container">
                    {menuData.tips?.length > 0 ? (
                        <ul>
                            {menuData.tips.map((tip, idx) => <li key={idx}>{tip}</li>)}
                        </ul>
                    ) : <p>No tips needed, just follow along and bon appétit!</p>}
                </div>

                <h2>Nutrition (per serving)</h2>
                <div className="nutrition-container">
                    {menuData.nutrition ? (
                        <ul>
                            <li>Calories: {menuData.nutrition.calories || 'N/A'}</li>
                            <li>Protein: {menuData.nutrition.protein || 'N/A'}</li>
                            <li>Fat: {menuData.nutrition.fat || 'N/A'}</li>
                            <li>Carbohydrates: {menuData.nutrition.carbohydrates || 'N/A'}</li>
                            <li>Sodium: {menuData.nutrition.sodium || 'N/A'}</li>
                            <li>Sugar: {menuData.nutrition.sugar || 'N/A'}</li>
                        </ul>
                    ) : <p>No nutrition data available.</p>}
                </div>
            </div>
        </div>
    );
};

const fetchMissingImages = async (menuList, ingredientList) => {
    let storedImages = getImageFromLocalStorage();

    if (!Array.isArray(storedImages.menu)) {
        storedImages.menu = [];
      }
      
    if (!storedImages) {
        storedImages = { menu: [], ingredient: {} }; // Ensure proper initialization
    }

    const missingMenuItems = menuList.filter(menuItem => 
        Array.isArray(storedImages.menu) && !storedImages.menu.some(storedMenu => storedMenu.name === menuItem.name)
    );

    const missingIngredients = ingredientList.filter(ingredient => 
        storedImages.ingredient && !(ingredient in storedImages.ingredient)
    );

    console.log("missingMenuItems:", missingMenuItems);
    console.log("missingIngredients:", missingIngredients);

    if (missingMenuItems.length > 0 || missingIngredients.length > 0) {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/get_ingredient_image`, { ingredients: missingIngredients });
            const fetchedImages = response.data;

            const newImages = {
                menu: [...storedImages.menu, ...missingMenuItems.map(item => ({ name: item.name, image: item.image }))],
                ingredient: { ...storedImages.ingredient, ...Object.fromEntries(fetchedImages.map(ingredient => [ingredient.ingredient, ingredient.imageUrl])) },
            };

            saveImageToLocalStorage(newImages);
            return newImages;
        } catch (error) {
            console.error('Error fetching images from backend:', error);
            return storedImages; // Return what we have so far
        }
    }

    return storedImages;
};

// ฟังก์ชันย่อหน่วย
const abbreviateUnit = (quantity) => {
    if (!quantity) return quantity;
    return quantity.replace(/\btablespoons?\b/gi, "tbsp");
};

export default MenuDetail;