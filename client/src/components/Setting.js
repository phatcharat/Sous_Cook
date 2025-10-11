import React, { useState, useEffect } from 'react';
import '../css/Setting.css';
import defaultProfile from '../image/profile.jpg';
import backicon from '../image/searchbar/Back.svg';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getUserId } from '../utils/auth';

const Setting = () => {
    const navigate = useNavigate();
    const userIdStr = getUserId();
    const userId = parseInt(userIdStr, 10);
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        avatar: '',
        phone_number: '',
        birth_date: '',
        country: '',
        allergies: [],
    });
    const [profilePic, setProfilePic] = useState(defaultProfile);
    const [newProfileFile, setNewProfileFile] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [allergyInput, setAllergyInput] = useState('');

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        if (!userId || isNaN(userId)) {
            console.error('Invalid userId:', userIdStr);
            navigate('/login');
            return;
        }

        const fetchUserData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/users/${userId}`);
                const user = response.data.user;

                setUserData({
                    ...user,
                    birth_date: formatDateForInput(user.birth_date),
                    allergies: user.allergies || []
                });

                setAllergyInput((user.allergies || []).join(', '));

                if (user.avatar_url) {
                    setProfilePic(user.avatar_url);
                } else if (user.avatar && user.avatar.length > 0) {
                    setProfilePic(`${process.env.REACT_APP_BASE_URL}/uploads/avatars/${user.avatar}`);
                } else {
                    setProfilePic(defaultProfile);
                }

            } catch (error) {
                console.error('Error fetching user data:', error);
                setProfilePic(defaultProfile);
                if (error.response?.status === 401 || error.response?.status === 403) {
                    navigate('/login');
                }
            }
        };

        fetchUserData();
    }, [userId, navigate, userIdStr]);

    const handleChange = (e) => {
        let { name, value } = e.target;

        if (name === "phone_number") {
            value = value.replace(/\D/g, '');
            if (value.length > 10) value = value.slice(0, 10);
        }

        if (name === "allergies") {
            setAllergyInput(value);
            return;
        }

        setUserData({
            ...userData,
            [name]: value,
        });
    };

    const handleProfileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfilePic(URL.createObjectURL(file));
            setNewProfileFile(file);
        }
    }

    const handleSave = async () => {
        try {
            const allergiesArray = allergyInput
                .split(',')
                .map(a => a.trim().toLowerCase())
                .filter(a => a.length > 0);

            const formData = new FormData();
            formData.append('username', userData.username);
            formData.append('email', userData.email);
            formData.append('phone_number', userData.phone_number || '');
            formData.append('birth_date', userData.birth_date || '');
            formData.append('country', userData.country || '');
            formData.append('allergies', JSON.stringify(allergiesArray));

            if (newProfileFile) {
                formData.append('avatar', newProfileFile);
            }

            const response = await axios.put(
                `${process.env.REACT_APP_BACKEND_URL}/users/${userId}`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            const updatedUser = response.data.user;
            setUserData({
                ...updatedUser,
                birth_date: formatDateForInput(updatedUser.birth_date),
                allergies: updatedUser.allergies || []
            });

            setAllergyInput((updatedUser.allergies || []).join(', '));

            if (updatedUser.avatar_url) {
                setProfilePic(updatedUser.avatar_url);
            } else if (updatedUser.avatar && updatedUser.avatar.length > 0) {
                setProfilePic(`${process.env.REACT_APP_BASE_URL}/uploads/avatars/${updatedUser.avatar}`);
            } else {
                setProfilePic(defaultProfile);
            }

            setNewProfileFile(null);

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
                <img
                    src={backicon}
                    alt="back"
                    className="back-icon"
                    onClick={() => navigate("/account")}
                    style={{ cursor: "pointer" }}
                />
                <p className="back-text">Account Setting</p>
            </div>

            <div className="setting-box">
                <label className="profile-image-label">
                    <img src={profilePic} className="profile-image" alt="profile" />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileChange}
                        style={{ display: 'none' }}
                    />
                </label>

                <div className="form-setting">
                    <label>Username</label>
                    <input
                        type="text"
                        name="username"
                        value={userData.username}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-setting">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={userData.email}
                        onChange={handleChange}
                    />
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
                    <input
                        type="date"
                        name="birth_date"
                        value={userData.birth_date || ''}
                        onChange={handleChange}
                    />
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

                <div className="form-setting">
                    <label>Allergies</label>
                    <input
                        type="text"
                        name="allergies"
                        value={allergyInput}
                        onChange={handleChange}
                        placeholder="Enter allergies separated by comma"
                    />
                </div>

                <button className="save-button" onClick={handleSave}>Save</button>
            </div>
        </div>
    );
};

export default Setting;