import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/MenuDetail.css'; 
import { getIngredientsFromLocalStorage, getImageFromLocalStorage, saveImageToLocalStorage } from '../utils/storageUtils';
import checkbox from '../image/menu-detail/Checkbox.svg';
import checkboxOncheck from '../image/menu-detail/Checkbox_check.svg';
import axios from 'axios';
import unknowIngImage from '../image/ingredient/unknow-ingredient.svg';
import unknowMenuImage from  '../image/menu-suggestion/notfound-image.svg';
import tips from '../image/menu-detail/tips.svg'

const MenuDetail = () => { 
    const navigate = useNavigate();
    const location = useLocation();
    const { menu, menu_id, isRandomMenu = false } = location.state || {};

    const [menuData, setMenuData] = useState(menu || null);
    const [checkedSteps, setCheckedSteps] = useState([]);
    const [ingredientImages, setIngredientImages] = useState({});
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // ย้อนกลับไปหน้าก่อนหน้าเสมอ
    const handleBackNavigation = () => {
        navigate(-1);
    };

    const handleCheck = (index) => {
        if (checkedSteps.includes(index)) {
            setCheckedSteps(checkedSteps.filter(stepIndex => stepIndex !== index));
        } else {
            setCheckedSteps([...checkedSteps, index]);
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

    // ถ้ามาจาก History ให้ fetch menu จาก DB
    useEffect(() => {
        if (!menuData && menu_id) {
            axios.get(`${process.env.REACT_APP_BACKEND_URL}/menus/${menu_id}`)
                .then(res => setMenuData(res.data))
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
    }, [menuData]); 

    // save history
    useEffect(() => {
        if (!menu_id) return;
        const userId = localStorage.getItem("user_id");
        if (!userId) return;

        axios.post(`${process.env.REACT_APP_BACKEND_URL}/history`, {
            user_id: userId,
            menu_id: menu_id
        })
        .then(res => console.log("History saved:", res.data))
        .catch(err => console.error("Error saving history:", err));
    }, [menu_id]);

    
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
                <img
                    src={menuData.image || unknowMenuImage}
                    alt={menuData.menu_name}
                    className="menu-image-large"
                />
            </div>

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
                    ) : <p>No tips available.</p>}
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

// โหลดรูป ingredient จาก external source
const fetchMissingImages = async (menuList, ingredientList) => {
    const images = {};
    ingredientList.forEach(ing => {
        images[ing] = `https://www.themealdb.com/images/ingredients/${encodeURIComponent(ing)}.png`;
    });
    return { menu: menuList, ingredient: images };
};

// ฟังก์ชันย่อหน่วย
const abbreviateUnit = (quantity) => {
    if (!quantity) return quantity;
    return quantity.replace(/\btablespoons?\b/gi, "tbsp");
};

export default MenuDetail;