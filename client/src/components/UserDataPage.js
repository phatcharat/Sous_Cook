import React, { useState, useEffect } from 'react';
import '../css/UserDataPage.css';  // Import the CSS file
import IconSetting from '../Icon/Button/Setting_btn.png';
import defaultProfile from '../image/profile.jpg';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserDataPage = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        avatar: '',
        avatar_url: defaultProfile,
        phone_number: '',
        birth_date: '',
        country: ''
    });

    const userIdStr = localStorage.getItem('user_id');
    const userId = parseInt(userIdStr, 10);


    useEffect(() => {
        if (!userId || isNaN(userId)) {
            console.error('Invalid userId:', userIdStr);
            navigate('/login');
            return;
        }
        // ดึงข้อมูล user จาก API
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`http://localhost:5050/api/users/${userId}`);
                const user = response.data.user;

                if (user.birth_date) {
                    user.birth_date = user.birth_date.split('T')[0];
                }

                setUserData(user);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, [userId, navigate]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };


    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    }

    const handleSetting = () => {
        navigate("/setting")
    }

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
                            src={userData.avatar
                                ? `data:image/jpeg;base64,${userData.avatar}`
                                : defaultProfile
                            }
                            id="pic-pro"
                            alt="avatar"
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
                    <div className="data">-</div>
                    <div className="title">Frequently Cooked</div>
                    <div className="data">-</div>
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
