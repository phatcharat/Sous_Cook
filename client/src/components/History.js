import React, { useState, useEffect } from 'react';
import '../css/History.css';
import '../css/Navbar.css';
import axios from 'axios';
import Navbar from '../components/Navbar.js';
import { useNavigate } from 'react-router-dom';
import { getUserId } from '../utils/auth.js';

// ฟังก์ชันคำนวณ "time ago"
const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

const HistoryScreen = () => {
    const [selected, setSelected] = useState('history');
    const [historyItems, setHistoryItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            const userId = getUserId();
            if (!userId) return;

            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/history/${userId}`);
                const formattedHistory = response.data.map(item => ({
                    id: item.history_id,
                    menuId: item.menu_id,
                    title: item.menu_name,
                    prepTime: item.prep_time,
                    cookingTime: item.cooking_time,
                    image: item.image,
                    alt: item.menu_name,
                    timeAgo: formatTimeAgo(item.created_at),
                    isLiked: false,
                }));

                setHistoryItems(formattedHistory);
            } catch (error) {
                console.error('Failed to fetch history:', error);
            }
        };

        fetchHistory();
    }, []);

    const goToMenuDetail = (menu) => {
        navigate('/menu-detail', { state: { menu_id: menu.menuId } });
    };

    const handleLike = (id) => {
        setHistoryItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, isLiked: !item.isLiked } : item
            )
        );
    };

    return (
        <div className="history-menu-container">
            <div className="header">
                <h1 className="title-meal">History</h1>
            </div>

            {historyItems.length === 0 ? (
                <div className="no-history-message">
                    <p>No history found. Start exploring some menus!</p>
                </div>
            ) : (
                <div className="history-list">
                    {historyItems.map((item, index) => (
                        <div key={item.id}>
                            <div 
                                className="recipe-card clickable" //เพิ่ม class ให้ cursor เป็น pointer
                                onClick={() => goToMenuDetail(item)} //คลิกแล้วไปหน้า detail
                            >
                                <div className="meal-content">
                                    <div className="meal-image">
                                        <img src={item.image} alt={item.alt} />
                                    </div>
                                    <div className="meal-info">
                                        <h3>{item.title}</h3>
                                        <p>Prep time: {item.prepTime}</p>
                                        <p>Cooking time: {item.cookingTime}</p>
                                    </div>
                                </div>
                            </div>
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
            )}

            <Navbar selected={selected} setSelected={setSelected} />
        </div>
    );
};

export default HistoryScreen;