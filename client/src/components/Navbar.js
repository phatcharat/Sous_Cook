import React, { useState } from 'react';
import '../css/Navbar.css';
import IconHome from '../image/nav_icon/icon_home.svg';
import IconHeart from '../image/nav_icon/icon_like.svg';
import IconCamera from '../image/nav_icon/icon_camera.svg';
import IconClock from '../image/nav_icon/icon_history.svg';
import IconUser from '../image/nav_icon/icon_people.svg';

const Navbar = ({ onCameraClick }) => {
    const [selected, setSelected] = useState('home');

    return (
        <div className="navbar">
            <a className={`home nav-item ${selected === 'home' ? 'selected' : ''}`} 
               onClick={() => setSelected('home')}>
                <img src={IconHome} alt="Home" />
            </a>
            <a className={`heart nav-item ${selected === 'heart' ? 'selected' : ''}`} 
               onClick={() => setSelected('heart')}>
                <img src={IconHeart} alt="Favorites" />
            </a>
            <a className={`camera nav-item ${selected === 'camera' ? 'selected' : ''}`} 
               onClick={onCameraClick}>
                <img src={IconCamera} alt="camera" />
            </a>
            <a className={`history nav-item ${selected === 'clock' ? 'selected' : ''}`} 
               onClick={() => setSelected('clock')}>
                <img src={IconClock} alt="history" />
            </a>
            <a className={`account nav-item ${selected === 'user' ? 'selected' : ''}`} 
               onClick={() => setSelected('user')}>
                <img src={IconUser} alt="account" />
            </a>
        </div>
    );
}

export default Navbar;
