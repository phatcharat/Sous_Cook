import React, { useState, useEffect } from 'react';
import '../css/UserDataPage.css';  // Import the CSS file
import IconSetting from '../Icon/Button/Setting_btn.png';
import defaultProfile from '../image/profile.jpg';
import { useNavigate } from 'react-router-dom';
const UserDataPage = () => {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);
   
    const [profilePic, setProfilePic] = useState(defaultProfile);

    const handleLogout = () => {
        navigate("/login")
    }

    const toggleMenu = () => {
        setShowMenu(!showMenu);
    }

    const changeProfileImage = (event) => {
        if (event.target.files && event.target.files[0]) {
        setProfilePic(URL.createObjectURL(event.target.files[0]));
        }
    };



    return (
      <div>
        <div className="profile-container">
            {/* setting button */}
            <div className="setting-container">
                 <img src={IconSetting} alt="setting" onClick={toggleMenu} style={{ cursor: "pointer" }}/>
                 { showMenu && (
                    <div className="dropDown-menu">
                        <div className="menu-items">
                            <label htmlFor="input-img" style={{cursor: "pointer"}}>
                                 Upload profile
                            </label>
                             <input type="file" accept="image/jpg, image/png, image/jpeg" id="input-img" onChange={changeProfileImage}></input>
                        </div>
                        <hr></hr>
                        <div className="menu-items" onClick={handleLogout}>
                        Log out
                        </div>
                    </div>
                 )}
            </div>
            <div className="profile-pic">
                <div className="border-box"></div>
                <div className="pic-con">
                    <img src={profilePic} id="pic-pro" alt="profile"/>
                    <div id="pic-border"></div>
                    {/* username */}
                    <div className="nameplace">user</div>
                </div> 
            </div>
            
        </div>

        <div className="userData-container">
            <div className="data-box-top">
                <div className="title">Email</div>
                <div className="data">user.000@example.com</div>
                <div className="title">Phone number</div>
                <div className="data">081-234-5678</div>
                <div className="title">Date</div>
                <div className="data">23/05/2000</div>
                <div className="title">Country</div>
                <div className="data">Thailand</div>
            </div>
            <div className="separator"></div>
            <div className="data-box-bottom">
                <div className="title">Meal Complete</div>
                <div className="data">45</div>
                <div className="title">Frequently Cooked</div>
                <div className="data">Tuna Salad Sandwich (7)</div>
            </div>

            <div className="logout-place">
                <button className="logout-button" onClick={handleLogout}>
                    LOG OUT
                </button>
            </div>

        </div>
      </div>
    );
  };
  
  export default UserDataPage;
