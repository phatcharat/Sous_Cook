import React, { useState, useEffect } from 'react';
import '../css/Setting.css';  // Import the CSS file
import defaultProfile from '../image/profile.jpg';
import backicon from '../image/searchbar/Back.svg';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Setting = () => {
    const navigate = useNavigate();
    const userIdStr = localStorage.getItem('user_id');
    const userId = parseInt(userIdStr, 10);
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        avatar: '',
        phone_number: '',
        birth_date: '',
        country: '',
    });
    const [profilePic, setProfilePic] = useState(defaultProfile);
    const [newProfileFile, setNewProfileFile] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

                setUserData(user);

                // ตรวจสอบ avatar ว่ามีค่าและไม่เป็น null/empty
                if (user.avatar && user.avatar.length > 0) {
                    setProfilePic(`data:image/png;base64,${user.avatar}`);
                } else {
                    setProfilePic(defaultProfile);
                }

            } catch (error) {
                console.error('Error fetching user data:', error);
                setProfilePic(defaultProfile); // fallback default
            }
        };

        fetchUserData();
    }, [userId, navigate]);

    const handleChange = (e) => {
        let { name, value } = e.target;

        if (name === "phone_number") {
            value = value.replace(/\D/g, '');
            if (value.length > 10) value = value.slice(0, 10);
        }

        setUserData({
            ...userData,
            [name]: value,
        });
    };

    const handleProfileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfilePic(URL.createObjectURL(file)); // preview
            setNewProfileFile(file);                  // ไฟล์จริง
        }
    }

    const handleSave = async () => {
        try {
            const formData = new FormData();
            formData.append('username', userData.username);
            formData.append('email', userData.email);
            formData.append('phone_number', userData.phone_number || '');
            formData.append('birth_date', userData.birth_date || '');
            formData.append('country', userData.country || '');

            if (newProfileFile) {
                formData.append('avatar', newProfileFile); // ส่งไฟล์จริง
            }

            const response = await axios.put(
                `http://localhost:5050/api/users/${userId}`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            const updatedUser = response.data.user;
            setUserData(updatedUser);

            if (updatedUser.avatar && updatedUser.avatar.length > 0) {
                setProfilePic(`data:image/jpeg;base64,${updatedUser.avatar}`);
            } else {
                setProfilePic(defaultProfile);
            }

            alert("User info updated successfully");
            navigate("/account");

        } catch (error) {
            console.error('Error updating user data:', error);
            alert("Failed to update user info.");
        }
    };

    const countries = [
        "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
        "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
        "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
        "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica",
        "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador",
        "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
        "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
        "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq",
        "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait",
        "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
        "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico",
        "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (Burma)", "Namibia", "Nauru",
        "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman",
        "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
        "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
        "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
        "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
        "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
        "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela",
        "Vietnam", "Yemen", "Zambia", "Zimbabwe"
    ].sort();


    return (
        <div className="setting-page">
            <div className="back-container">
                <img src={backicon} alt="back" className="back-icon" onClick={() => navigate("/account")} style={{ cursor: "pointer" }} />
                <p className="back-text">Account Setting</p>
            </div>

            <div className="setting-box">
                <label className="profile-image-label">
                    <img src={profilePic} className="profile-image" alt="profile" />
                    <input type="file" accept="image/*" onChange={handleProfileChange} style={{ display: 'none' }} />
                </label>

                <div className="form-setting">
                    <label>Username</label>
                    <input type="text" name="username" value={userData.username} onChange={handleChange} />
                </div>
                <div className="form-setting">
                    <label>Email</label>
                    <input type="email" name="email" value={userData.email} onChange={handleChange} />
                </div>
                <div className="form-setting">
                    <label>Phone number</label>
                    <input
                        type="text"
                        name="phone_number"
                        value={userData.phone_number || ''}
                        onChange={handleChange}
                        maxLength={10}
                    />
                </div>
                <div className="form-setting">
                    <label>Date of Birth</label>
                    <input type="date" name="birth_date" value={userData.birth_date || ''} onChange={handleChange} />
                </div>
                <div className="form-setting">
                    <label>Country</label>
                    <div className="dropdown-container">
                        <div
                            className="dropdown-selected"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            {userData.country || "Select a country"}
                        </div>

                        {isDropdownOpen && (
                            <div className="dropdown-options">
                                {countries.map((c) => (
                                    <div
                                        key={c}
                                        className="dropdown-option"
                                        onClick={() => {
                                            handleChange({ target: { name: "country", value: c } });
                                            setIsDropdownOpen(false);
                                        }}
                                    >
                                        {c}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <button className="save-button" onClick={handleSave}>Save</button>
            </div>
        </div>
    );
};


export default Setting;
