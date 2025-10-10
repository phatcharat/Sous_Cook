import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/Listpage.css";

const Listpage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const shoppingList = location.state?.missingIngredients || [];

  // state สำหรับ popup
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="shopping-list-container">
      {/* Header */}
      <div className="shopping-header">
        <button className="back-button" onClick={() => navigate(-1)}>Shopping List</button>
      </div>

      {/* List Items */}
      <div className="shopping-items">
        {shoppingList.length > 0 ? (
          shoppingList.map((item, idx) => (
            <div key={idx} className="shopping-card">
              <img src={item.image} alt={item.name} className="shopping-image" />
              <p>{item.name}</p>
            </div>
          ))
        ) : (
          <p className="empty-text">No ingredients added yet.</p>
        )}
      </div>

      {/* Order button */}
      {shoppingList.length > 0 && (
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
                LINE MAN
              </button>
              <button
                className="sponsor-button grab"
                onClick={() =>
                  window.open("https://food.grab.com/mart", "grabPopup", "width=600,height=800")
                }
              >
                Grab
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

export default Listpage;
