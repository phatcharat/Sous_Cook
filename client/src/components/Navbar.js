import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for routing
import '../css/Navbar.css';
import IconHome from '../image/nav_icon/icon_home.svg';
import IconHeart from '../image/nav_icon/icon_like.svg';
import IconCamera from '../image/nav_icon/icon_camera.svg';
import IconClock from '../image/nav_icon/icon_history.svg';
import IconUser from '../image/nav_icon/icon_people.svg';

const Navbar = ({ onCameraClick }) => {
    const [selected, setSelected] = useState('home');
    const navigate = useNavigate(); // Initialize navigation hook

    const handleNavigation = (page) => {
        setSelected(page);
        navigate(`/${page}`); // Navigate to the selected page
    };

    return (
        <div className="navbar">
            <a className={`home nav-item ${selected === 'home' ? 'selected' : ''}`} 
               onClick={() => handleNavigation('home')}>
                <img src={IconHome} alt="Home" />
            </a>
            <a className={`heart nav-item ${selected === 'favorites' ? 'selected' : ''}`} 
               onClick={() => handleNavigation('favorites')}>
                <img src={IconHeart} alt="Favorites" />
            </a>
            <a className={`camera nav-item ${selected === 'camera' ? 'selected' : ''}`} 
               onClick={onCameraClick}>
                <img src={IconCamera} alt="camera" />
            </a>
            <a className={`history nav-item ${selected === 'history' ? 'selected' : ''}`} 
               onClick={() => handleNavigation('history')}>
                <img src={IconClock} alt="history" />
            </a>
            <a className={`account nav-item ${selected === 'account' ? 'selected' : ''}`} 
               onClick={() => handleNavigation('account')}>
                <img src={IconUser} alt="account" />
            </a>
        </div>
    );
}

export default Navbar;
