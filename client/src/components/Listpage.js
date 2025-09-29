import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/Listpage.css";

const Listpage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // รับ missingIngredients จาก MenuDetail
  const shoppingList = location.state?.missingIngredients || [];

  return (
    <div className="shopping-list-container">
      {/* Header */}
      <div className="shopping-header">
          <button className="back-button" onClick={()=>navigate('/menu-detail')}></button>
          <h1 className="ingredient-header">Shopping List</h1>
      </div>

      {/* List Items */}
      <div className="shopping-items">
        {shoppingList.length > 0 ? (
          shoppingList.map((item, idx) => (
            <div key={idx} className="shopping-card">
              <img 
                src={item.image} 
                alt={item.name} 
                className="shopping-image" 
              />
              <p>{item.name}</p>
            </div>
          ))
        ) : (
          <p className="empty-text">No ingredients added yet.</p>
        )}
      </div>

      {/* Sponsor button */}
      {shoppingList.length > 0 && (
        <button className="sponsor-button">
          Order via (Our sponsor)
        </button>
      )}
    </div>
  );
};

export default Listpage;
