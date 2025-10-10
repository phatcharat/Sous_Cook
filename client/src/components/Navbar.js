import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate for routing
import '../css/Navbar.css';
import IconHome from '../image/nav_icon/icon_home.svg';
import IconHeart from '../image/nav_icon/icon_like.svg';
import IconCamera from '../image/nav_icon/icon_camera.svg';
import IconClock from '../image/nav_icon/icon_history.svg';
import IconUser from '../image/nav_icon/icon_people.svg';

const Navbar = () => {
    const navigate = useNavigate(); // Initialize navigation hook
    const location = useLocation();

    const currentPath = location.pathname.replace('/', '') || 'home';

    const handleNavigation = (page) => {
        navigate(`/${page}`); // Navigate to the selected page
    };

    return (
        <div className="navbar">
            <a className={`home nav-item ${currentPath === 'home' ? 'selected' : ''}`} 
               onClick={() => handleNavigation('home')}>
                <img src={IconHome} alt="home" />
            </a>
            <a className={`heart nav-item ${currentPath === 'favorites' ? 'selected' : ''}`} 
               onClick={() => handleNavigation('favorites')}>
                <img src={IconHeart} alt="favorites" />
            </a>
            <a className={`camera nav-item ${currentPath === 'camera' ? 'selected' : ''}`} 
               onClick={() => handleNavigation('camera')}>
                <img src={IconCamera} alt="camera" />
            </a>
            <a className={`history nav-item ${currentPath === 'history' ? 'selected' : ''}`} 
               onClick={() => handleNavigation('history')}>
                <img src={IconClock} alt="history" />
            </a>
            <a className={`account nav-item ${currentPath === 'account' ? 'selected' : ''}`} 
               onClick={() => handleNavigation('account')}>
                <img src={IconUser} alt="account" />
            </a>
        </div>
    );
}

export default Navbar;
