import React, { useState, useEffect } from 'react';
import '../css/History.css';
import '../css/Navbar.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getUserId } from '../utils/auth.js';

// ฟังก์ชันคำนวณ "time ago"
const formatTimeAgo = (date) => {
    const now = new Date();
    const then = new Date(date);
    let seconds = Math.floor((now - then) / 1000);
    if (seconds < 0) seconds = 0; // ไม่ให้ติดลบ
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
                const userFavorites = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/favorites/${userId}`);
                const favoriteMenuIds = userFavorites.data.map(f => f.menu_id);
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/history/${userId}`);
                const formattedHistory = response.data
                    .map(item => ({
                        id: item.history_id,
                        menuId: item.menu_id,
                        title: item.menu_name,
                        prepTime: item.prep_time,
                        cookingTime: item.cooking_time,
                        image: item.image,
                        alt: item.menu_name,
                        createdAt: new Date(item.created_at), // เก็บเป็น Date object
                        isLiked: favoriteMenuIds.includes(item.menu_id),
                    }))
                    .sort((a, b) => b.createdAt - a.createdAt) // เรียงล่าสุดก่อน
                    .map(item => ({
                        ...item,
                        timeAgo: formatTimeAgo(item.createdAt)
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

   const handleLike = async (item) => {
        const userId = localStorage.getItem('user_id');
        if (!userId) return;

        try {
            if (!item.isLiked) {
                // ถ้ายังกด like → เพิ่มเข้า favorites
                await axios.post(`${process.env.REACT_APP_BACKEND_URL}/favorites`, {
                    user_id: userId,
                    menu_id: item.menuId
                });
            } else {
                // ถ้าเคย like แล้วกดอีกครั้ง → ลบออก
                await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/favorites`, {
                    data: { user_id: userId, menu_id: item.menuId }
                });
            }

            // อัปเดต state
            setHistoryItems(prevItems =>
                prevItems.map(his =>
                    his.id === item.id ? { ...his, isLiked: !his.isLiked } : his
                )
            );
        } catch (error) {
            console.error("Error toggling favorite:", error);
        }
    };


    return (
        <div className="history-menu-container">
            <div className="header">
                <h1 className="title-meal">History</h1>
            </div>
            <div className="meal-lists">
            {historyItems.length === 0 ? (
                <div className="no-history-message">
                    <p>No history found. Start exploring some menus!</p>
                </div>
            ) : (
                    historyItems.map((item, index) => (
                        <div key={item.id}>
                            <div className="meal-cards">
                            <div 
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
                                <button className="liker-button" onClick={() => handleLike(item)}>
                                    <i className={`fas fa-heart heart-icon ${item.isLiked ? 'liked' : ''}`}></i>
                                </button>
                                <p className="time-ago">{item.timeAgo}</p>
                            </div>
                            {index < historyItems.length - 1 && <div className="meal-separator"></div>}
                            </div>
                        </div>
                    ))
            )}
            </div>
        </div>
    );
};

export default HistoryScreen;