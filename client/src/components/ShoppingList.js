import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getShoppingListFromStorage, saveShoppingListToStorage } from '../utils/storageUtils';
import { getUserId, isLoggedIn } from '../utils/auth';
import "../css/ShoppingList.css";
import grabLogo from '../image/shopping_list/Grab.svg';
import linemanLogo from '../image/shopping_list/Line_man.png';

const ShoppingList = () => {
  const navigate = useNavigate();
  const userId = getUserId();

  const [shoppingList, setShoppingList] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    const savedList = getShoppingListFromStorage(userId);
    setShoppingList(savedList);
  }, [userId, navigate]);

  const handleRemoveItem = (index) => {
    const newList = shoppingList.filter((_, idx) => idx !== index);
    setShoppingList(newList);
    saveShoppingListToStorage(newList);
  };

  return (
    <div className="shopping-list-container">
      {/* Header */}
      <div className="shopping-header">
        <button className="back-button" onClick={() => navigate(-1)}></button>
        <h1>Shopping List</h1>
      </div>

      {/* List Items */}
      <div className="shopping-items">
        {Array.isArray(shoppingList) && shoppingList.length > 0 ? (
          shoppingList.map((item, idx) => (
            <div key={idx} className="shopping-card">
              <img src={item.image} alt={item.name} className="shopping-image" />
              <p>{item.name}</p>
              <button
                className="remove-item"
                onClick={() => handleRemoveItem(idx)}
              >
                ×
              </button>
            </div>
          ))
        ) : (
          <p className="empty-text">No ingredients added yet.</p>
        )}
      </div>

      {/* Order button */}
      {Array.isArray(shoppingList) && shoppingList.length > 0 && (
        <button className="order-button" onClick={() => setShowPopup(true)}>
          Order
        </button>
      )}

      {/* Popup Modal */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Choose Delivery App</h2>
            <div className="popup-buttons">
              <button
                className="sponsor-button lineman"
                onClick={() =>
                  window.open("https://lineman.line.me/mart", "linemanPopup", "width=600,height=800")
                }
              >
                <img src={linemanLogo} alt="LINE MAN"/>
              </button>

              <button
                className="sponsor-button grab"
                onClick={() =>
                  window.open("https://food.grab.com/mart", "grabPopup", "width=600,height=800")
                }
              >
                <img src={grabLogo} alt="Grab"/>
              </button>
            </div>
            <button className="close-button" onClick={() => setShowPopup(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingList;
