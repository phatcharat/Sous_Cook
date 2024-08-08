import React, { useState } from 'react';
import '../css/Navbar.css';
import IconHome from '../image/nav_icon/icon_home.svg';
import IconHeart from '../image/nav_icon/icon_like.svg';
import IconCamera from '../image/nav_icon/icon_camera.svg';
import IconClock from '../image/nav_icon/icon_history.svg';
import IconUser from '../image/nav_icon/icon_people.svg';

const Navbar = ({ onCameraClick }) => {
    const [selected, setSelected] = useState('');

    return (
        <div className="navbar">
            <a className={`nav-item ${selected === 'home' ? 'selected' : ''}`} 
               onClick={() => setSelected('home')}>
                <img src={IconHome} alt="Home" />
            </a>
            <a className={`nav-item ${selected === 'heart' ? 'selected' : ''}`} 
               onClick={() => setSelected('heart')}>
                <img src={IconHeart} alt="Favorites" />
            </a>
            <a className={`nav-item ${selected === 'camera' ? 'selected' : ''}`} 
               onClick={onCameraClick}>
                <img src={IconCamera} alt="Camera" />
            </a>
            <a className={`nav-item ${selected === 'clock' ? 'selected' : ''}`} 
               onClick={() => setSelected('clock')}>
                <img src={IconClock} alt="History" />
            </a>
            <a className={`nav-item ${selected === 'user' ? 'selected' : ''}`} 
               onClick={() => setSelected('user')}>
                <img src={IconUser} alt="Account" />
            </a>
        </div>
    );
}

export default Navbar;
