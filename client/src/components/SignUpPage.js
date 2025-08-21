import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/SignUpPage.css';
import logo from '../image/Logo1.svg';
import textlogo from '../image/TextLogo.svg';
import axios from 'axios';

const SignUpPage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateField = (name, value) => {
        switch (name) {
            case 'username':
                if (!value.trim()) return 'Username is required';
                if (value.length < 3) return 'Username must be at least 3 characters';
                if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
                return '';
            case 'email':
                if (!value.trim()) return 'Email is required';
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) return 'Invalid email format';
                return '';
            case 'password':
                if (!value) return 'Password is required';
                if (value.length < 4) return 'Password must be at least 4 characters';
                return '';
            default:
                return '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate all fields
        const usernameError = validateField('username', formData.username);
        const emailError = validateField('email', formData.email);
        const passwordError = validateField('password', formData.password);

        if (usernameError) {
            setMessage(usernameError);
            return;
        }
        if (emailError) {
            setMessage(emailError);
            return;
        }
        if (passwordError) {
            setMessage(passwordError);
            return;
        }

        try {
            const response = await axios.post('http://localhost:5050/signup', formData);
            // Success
            setSuccess(response.data.message);
            setError('');

            setTimeout(() => {
            navigate('/login');
        }, 1500);

        } catch (err) {
            if (err.response) {
                // Error message from server
                setError(err.response.data.message);
            } else {
                setError('Server Error');
            }
            setSuccess('');
        }

        
    };


    const handleGuestClick = () => {
        navigate('/home');
    };

    return (
        <div className="page-container">
            <img src={logo} alt="Sous Cook Logo" className="logo-image"/>
            <img src={textlogo} alt="Text Logo" className="textlogo-image"/>
            <div className="signup-container">
                <p className="signup-text">Sign Up</p>
                <form className="signup-form" onSubmit={handleSubmit}>
                    <input type="text" name="username" placeholder="Username" className="input" value={formData.username} onChange={handleChange} required />
                    <input type="email" name="email" placeholder="Email" className="input" value={formData.email} onChange={handleChange} required />
                    <input type="password" name="password" placeholder="Password" className="input" value={formData.password} onChange={handleChange} required />
                    <button type="submit" className="summit-button">CREATE AN ACCOUNT</button>
                </form>
                {message && <p>{message}</p>}
                {success && <p className="alert-success">{success}</p>}
                {error && <p className="alert-error">{error}</p>}
            </div>
            <p className="guest-text">Or you want to take a look first?</p>
            <button className="guest-button" onClick={handleGuestClick}>CONTINUE AS GUEST</button>
        </div>
    );
};
export default SignUpPage;