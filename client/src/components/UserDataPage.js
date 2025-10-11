import React, { useState, useEffect } from 'react';
import '../css/UserDataPage.css';  // Import the CSS file
import IconSetting from '../Icon/Button/Setting_btn.png';
import defaultProfile from '../image/profile.jpg';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getUserId, removeUserId } from '../utils/auth';

const UserDataPage = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        avatar: '',
        avatar_url: '',
        phone_number: '',
        birth_date: '',
        country: ''
    });

    const [profileImage, setProfileImage] = useState(defaultProfile);

    const userIdStr = getUserId();
    const userId = parseInt(userIdStr, 10);

    const [mealStats, setMealStats] = useState({
        total_completed: null,
        most_cooked: null
    });

    // Add this utility function after the imports
    const logUserAction = (action, details = {}) => {
        // Create a sanitized copy of details
        const safeDetails = { ...details };
        
        // Remove or mask sensitive fields
        if (safeDetails.userId) safeDetails.userId = '****';
        if (safeDetails.email) safeDetails.email = '****@****.***';
        if (safeDetails.username) safeDetails.username = '****';
        if (safeDetails.phone_number) safeDetails.phone_number = '****';
        
        console.log(`UserData - ${action}:`, safeDetails);
    };

    useEffect(() => {
        if (!userId || isNaN(userId)) {
            logUserAction('auth_check_failed', { valid: false });
            navigate('/login');
            return;
        }

        const fetchUserData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/users/${userId}`);
                const user = response.data.user;

                // Replace direct console.logs with safe logging
                logUserAction('data_fetch_success', {
                    hasAvatar: !!user.avatar_url,
                    hasBirthDate: !!user.birth_date,
                    hasPhoneNumber: !!user.phone_number,
                    hasCountry: !!user.country
                });

                if (user.birth_date) {
                    user.birth_date = user.birth_date.split('T')[0];
                }

                setUserData(user);

                if (user.avatar_url) {
                    setProfileImage(`${user.avatar_url}?t=${Date.now()}`);
                } else {
                    setProfileImage(defaultProfile);
                }

            } catch (error) {
                logUserAction('data_fetch_error', {
                    status: error.response?.status,
                    error: error.message
                });
                setProfileImage(defaultProfile);
            }
        };

        fetchUserData();
    }, [userId, navigate, userIdStr]);

    useEffect(() => {
        if (!userId || isNaN(userId)) {
            return;
        }

        const fetchMealStats = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_URL}/users/${userId}/meal-stats`
                );
                setMealStats(response.data);
                console.log('Meal stats:', response.data);
            } catch (error) {
                console.error('Error fetching meal stats:', error);
            }
        };

        fetchMealStats();
    }, [userId]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };


    const handleLogout = () => {
        removeUserId();
        navigate("/login");
    }

    const handleSetting = () => {
        navigate("/setting")
    }

    const handleImageError = () => {
        logUserAction('avatar_load_error');
        setProfileImage(defaultProfile);
    };

    return (
        <div>
            <div className="profile-container">
                {/* setting button */}
                <div className="setting-container">
                    <img src={IconSetting} alt="setting" onClick={handleSetting} style={{ cursor: "pointer" }} />
                </div>
                <div className="profile-pic">
                    <div className="border-box"></div>
                    <div className="pic-con">
                        <img
                            src={profileImage}
                            id="pic-pro"
                            alt="avatar"
                            onError={handleImageError}
                        />
                        <div id="pic-border"></div>
                        <div className="nameplace">{userData.username}</div>
                    </div>
                </div>

            </div>

            <div className="userData-container">
                <div className="data-box-top">
                    <div className="title">Email</div>
                    <div className="data">{userData.email}</div>
                    <div className="title">Phone number</div>
                    <div className="data">{userData.phone_number || '-'}</div>
                    <div className="title">Date of Birth</div>
                    <div className="data">{formatDate(userData.birth_date)}</div>
                    <div className="title">Country</div>
                    <div className="data">{userData.country || '-'}</div>
                </div>
                <div className="separator"></div>
                <div className="data-box-bottom">
                    <div className="title">Meal Complete</div>
                    <div className="data">
                        {mealStats.total_completed !== null && mealStats.total_completed > 0
                            ? mealStats.total_completed
                            : '-'
                        }
                    </div>
                    <div className="title">Frequently Cooked</div>
                    <div className="data">
                        {mealStats.most_cooked
                            ? `${mealStats.most_cooked.menu_name} (${mealStats.most_cooked.cook_count})`
                            : '-'
                        }
                    </div>
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