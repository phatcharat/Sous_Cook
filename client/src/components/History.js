import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/History.css';
import '../css/Navbar.css';
import IconHome from '../image/nav_icon/icon_home.svg';
import IconHeart from '../image/nav_icon/icon_like.svg';
import IconCamera from '../image/nav_icon/icon_camera.svg';
import IconClock from '../image/nav_icon/icon_history.svg';
import IconUser from '../image/nav_icon/icon_people.svg';
import Satay from '../image/Satay.jpg';
import TomYum from '../image/TomYum.jpg';
import Sandwich from '../image/Sandwich.jpg';

const HistoryScreen = () => {
    const [selected, setSelected] = useState('history');
    const [historyItems, setHistoryItems] = useState([
        // {
        //     id: 1,
        //     title: "Pork Fried Rice",
        //     prepTime: "10 - 15 mins",
        //     cookingTime: "15 - 20 mins",
        //     image: PorkFriedRice,
        //     alt: "Pork Fried Rice",
        //     timeAgo: "2 hours ago",
        //     isLiked: false
        // },
        {
            id: 2,
            title: "Chicken Satay Skewer with Peanut Sauce",
            prepTime: "15 - 20 mins",
            cookingTime: "30 - 45 mins",
            image: Satay,
            alt: "Chicken satay skewers with peanut sauce",
            timeAgo: "1 day ago",
            isLiked: true // Example of an already liked item
        },
        {
            id: 3,
            title: "Thai Tom Yum Soup with Shrimp",
            prepTime: "15 - 20 mins",
            cookingTime: "30 - 45 mins",
            image: TomYum,
            alt: "Thai Tom Yum soup with shrimp",
            timeAgo: "1 day ago",
            isLiked: false
        },
        {
            id: 4,
            title: "Tuna Salad Sandwich",
            prepTime: "5 - 10 mins",
            cookingTime: "-",
            image: Sandwich,
            alt: "Tuna salad sandwich",
            timeAgo: "2 days ago",
            isLiked: true
        },
        // {
        //     id: 5,
        //     title: "Pasta with Pesto",
        //     prepTime: "5 - 10 mins",
        //     cookingTime: "8 - 12 mins",
        //     image: PastaPesto,
        //     alt: "Pasta with Pesto",
        //     timeAgo: "2 days ago",
        //     isLiked: false
        // },
        {
            id: 6,
            title: "Tuna Salad Sandwich",
            prepTime: "5 - 10 mins",
            cookingTime: "-",
            image: Sandwich,
            alt: "Tuna salad sandwich",
            timeAgo: "3 days ago",
            isLiked: false
        }
    ]);

    const navigate = useNavigate();

    const handleNavigation = (page) => {
        setSelected(page);
        navigate(`/${page}`);
    };

    const handleLike = (id) => {
        setHistoryItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, isLiked: !item.isLiked } : item
            )
        );
    };

    return (
        <div className="history-menu-container"> {/* ✅ Updated container class name */}
            {/* Header */}
            <div className="header">
                <h1 className="title-meal">History</h1>
            </div>

            {/* History Item List */}
            <div className="history-list"> {/* ✅ Updated list class name */}
                {historyItems.map((item, index) => (
                    <div key={item.id}>
                        <div className="recipe-card">
                            <div className="meal-content">
                                {/* Item Image */}
                                <div className="meal-image">
                                    <img src={item.image} alt={item.alt} />
                                </div>
                                {/* Item Info */}
                                <div className="meal-info">
                                    <h3>{item.title}</h3>
                                    <p>Prep time: {item.prepTime}</p>
                                    <p>Cooking time: {item.cookingTime}</p>
                                </div>
                            </div>
                        </div>

                        {/* Time Ago and Heart Icon */}
                            <div className="card-right-section">
                                <button className="like-button" onClick={() => handleLike(item.id)}>
                                    <i className={`fas fa-heart heart-icon ${item.isLiked ? 'liked' : ''}`}></i>
                                </button>
                                <p className="time-ago">{item.timeAgo}</p>
                            </div>

                        {index < historyItems.length - 1 && <div className="meal-separator"></div>}
                    </div>
                ))}
            </div>


            {/* Navigation Bar */}
            <div className="navbar">
                <a className={`home nav-item ${selected === 'home' ? 'selected' : ''}`} onClick={() => handleNavigation('home')}>
                    <img src={IconHome} alt="home" />
                </a>
                <a className={`heart nav-item ${selected === 'favorites' ? 'selected' : ''}`} onClick={() => handleNavigation('favorites')}>
                    <img src={IconHeart} alt="favorites" />
                </a>
                <a className={`camera nav-item ${selected === 'camera' ? 'selected' : ''}`} onClick={() => handleNavigation('camera')}>
                    <img src={IconCamera} alt="camera" />
                </a>
                <a className={`history nav-item ${selected === 'history' ? 'selected' : ''}`} onClick={() => handleNavigation('history')}>
                    <img src={IconClock} alt="history" />
                </a>
                <a className={`account nav-item ${selected === 'account' ? 'selected' : ''}`} onClick={() => handleNavigation('account')}>
                    <img src={IconUser} alt="account" />
                </a>
            </div>
        </div>
    );
}

export default HistoryScreen;