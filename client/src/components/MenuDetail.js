import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import Camera from './CameraSharedDish';

const MenuDetail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { menu, menu_id, isRandomMenu = false } = location.state || {};
    const sharedDishImage = location.state?.sharedDishImage; 

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

    // for share your dish photo (small community)
    const [dishImage, setDishImage] = useState(sharedDishImage || require('../image/chef.png'));
    const [hasDishPhoto, setHasDishPhoto] = useState(!!sharedDishImage);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const dishFileInputRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [posts, setPosts] = useState([]);
    const capturedImage = location.state?.image || null; //select photo
    const [dishCaption, setDishCaption] = useState('');  
    const [ignoreSharedDish, setIgnoreSharedDish] = useState(false);  

    const actualMenuId = menu_id || menuData?.menu_id;

    // Back navigation
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

    const handleAllergyAcknowledge = () => {
        setShowAllergyAlert(false);
        setHasAcknowledgedAllergy(true);
    };

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

    // Share dish picture
    const handleCancel = () => {
        setDishImage(require('../image/chef.png'));
        setHasDishPhoto(false);
        setDishCaption('');
        setIgnoreSharedDish(true);
    };

    const handleChooseDishFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setDishImage(reader.result);
            setHasDishPhoto(true);
        };
        reader.readAsDataURL(file);
    };

    // แปลง base64 เป็น File
    const dataURLtoFile = async (dataurl, filename) => {
        const res = await fetch(dataurl);
        const blob = await res.blob();
        return new File([blob], filename, { type: blob.type });
    };

    // Submit รูปไป community
    const handleSubmitDish = async () => {
        if (!dishImage || !actualMenuId) return;
        const userId = getUserId();
        if (!userId) return;

        try {
            const file = await dataURLtoFile(dishImage, 'dish.png');
            const formData = new FormData();
            formData.append('image', file);
            formData.append('user_id', userId);
            formData.append('menu_id', actualMenuId);
            formData.append('caption', dishCaption);

            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/community`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            navigate('/community', { state: { dishImage, menu_id: actualMenuId } });
        } catch (err) {
            console.error("Upload failed:", err);
        }
    };

    // Fetch menu if coming from History
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

    // Load ingredient and menu images
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
    }, [menuData?.menu_name]);

    // Save history
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

    // Check favorite status
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

    // Fetch user allergies and check for alerts - COMBINED INTO ONE EFFECT
    useEffect(() => {
        const fetchAllergiesAndCheck = async () => {
            const userId = getUserId();
            if (!userId || !menuData?.ingredients_quantity) return;

            try {
                // Fetch user allergies
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/users/${userId}`);
                const allergies = response.data.user.allergies || [];
                const allergyList = allergies.map(a => a.toLowerCase());
                setUserAllergies(allergyList);

                // Only check allergies if we have them and haven't acknowledged yet
                if (allergyList.length === 0 || hasAcknowledgedAllergy) return;

                const ingredients = Object.keys(menuData.ingredients_quantity);

                try {
                    // Call the backend to analyze allergies using GPT
                    const allergyResponse = await axios.post(
                        `${process.env.REACT_APP_BACKEND_URL}/analyze-allergies`,
                        {
                            ingredients: ingredients,
                            allergies: allergyList
                        }
                    );

                    const { alerts } = allergyResponse.data;

                    if (alerts && alerts.length > 0) {
                        setAllergyAlerts(alerts);
                        setShowAllergyAlert(true);
                    }
                } catch (allergyError) {
                    console.error('Error checking allergies with GPT, using fallback:', allergyError);
                    
                    // Fallback to simple string matching if API fails
                    const alerts = [];
                    ingredients.forEach(ingredient => {
                        const ingredientLower = ingredient.toLowerCase();
                        if (allergyList.some(allergy => ingredientLower.includes(allergy))) {
                            alerts.push(ingredient);
                        }
                    });

                    if (alerts.length > 0) {
                        setAllergyAlerts(alerts);
                        setShowAllergyAlert(true);
                    }
                }
            } catch (error) {
                console.error('Error fetching user allergies:', error);
            }
        };

        fetchAllergiesAndCheck();
    }, [menuData?.ingredients_quantity, hasAcknowledgedAllergy]); // Only depend on what's necessary

    // share dish
    useEffect(() => {
        if (sharedDishImage && !ignoreSharedDish && !isSubmitting) {
            setDishImage(sharedDishImage);
            setHasDishPhoto(true);
        }
    }, [sharedDishImage, ignoreSharedDish, isSubmitting]);

    
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
                            <p>This recipe contains :</p>
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
            {/* share your dish section */}
            <div className="share-dish-container">
                <img src={dishImage} alt="dish" className="chef" />

                <h3>Share your dish</h3>

                {!hasDishPhoto && (
                    <div className="photo-buttons">
                    <button className="take-photo-button" onClick={() => navigate("/camera-share-dish", { state: { menu_id: actualMenuId }, replace: true })}>
                    Take a photo
                    </button>
                    <button className="select-photo-button" onClick={() => dishFileInputRef.current.click()}>
                    Select photo
                    </button>

                    <input
                        type="file"
                        accept="image/*"
                        ref={dishFileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleChooseDishFile}
                    />
                    </div>
                )}

                {hasDishPhoto && (
                    <div className="submit-buttons">
                        <textarea
                            placeholder="Write a caption..."
                            value={dishCaption}
                            onChange={(e) => setDishCaption(e.target.value)}
                            className="dish-caption-box"
                        />
                        <div className="button-row">
                            <button className="share-button" onClick={handleSubmitDish}>
                                Submit
                            </button>
                            <button className="retake-button" onClick={handleCancel}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
                </div>
                <div className="go-community-container">
                    <button 
                    className="go-community-button" 
                    onClick={() => navigate('/community', { state: { dishImage, menu_id: actualMenuId } })}
                    >
                    See the Community
                    </button>
            </div>            
        </div>
    );
};

const fetchMissingImages = async (menuList, ingredientList) => {
    let storedImages = getImageFromLocalStorage();

    if (!storedImages || !Array.isArray(storedImages.menu)) {
        storedImages = { menu: [], ingredient: {} };
    }

    const missingMenuItems = menuList.filter(menuItem => 
        !storedImages.menu.some(storedMenu => storedMenu.name === menuItem.name)
    );

    const missingIngredients = ingredientList.filter(ingredient => 
        !(ingredient in storedImages.ingredient)
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
            return storedImages;
        }
    }

    return storedImages;
};

const abbreviateUnit = (quantity) => {
    if (!quantity) return quantity;
    return quantity.replace(/\btablespoons?\b/gi, "tbsp");
};

export default MenuDetail;