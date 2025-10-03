import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/SignUpPage.css';
import logo from '../image/Logo1.svg';
import textlogo from '../image/TextLogo.svg';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

const SignUpPage = () => {
    const navigate = useNavigate();
    const timeoutRef = useRef(null);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);

    const [fieldErrors, setFieldErrors] = useState({});
    const [alert, setAlert] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // clear field error
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }

        // clear alert
        if (alert.message) {
            setAlert({ type: '', message: '' });
        }
    };

    const validateField = (name, value) => {
        switch (name) {
            case 'username':
                if (!value.trim()) return 'Username is required';
                if (value.length < 3) return 'Username must be at least 3 characters';
                if (value.length > 20) return 'Username must not exceed 20 characters'
                if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
                return '';
            case 'email':
                if (!value.trim()) return 'Email is required';
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) return 'Please enter a valid email address';
                return '';
            case 'password':
                if (!value) return 'Password is required';
                if (value.length < 8) return 'Password must be at least 8 characters';
                if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) return 'Password must contain uppercase, lowercase, and number';
                return '';
            default:
                return '';
        }
    };

    const validateForm = () => {
        const errors = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) errors[key] = error;
        });
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // validate all fields
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setAlert({
                type: 'error',
                message: 'Please fix the error above'
            });
            return;
        }

        setIsSubmitting(true);
        setAlert({ type: '', message: '' });

        try {
            const response = await axios.post(`${API_URL}/signup`, formData);

            setAlert({
                type: 'success',
                message: response.data.message || 'Account created successfully.'
            });
            setFieldErrors({});

            timeoutRef.current = setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err) {
            let errorMessage = 'An error occured. Please try again.';

            if (err.response?.data?.message){
                errorMessage = err.response.data.message;
            } else if (err.request) {
                errorMessage = 'Cannot connect to server. Please chack your connection.';
            }

            setAlert({ type: 'error', message: errorMessage});
        } finally {
            setIsSubmitting(false);
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
                <form className="signup-form" onSubmit={handleSubmit} noValidate>
                    <div className="form-field">
                        <input 
                            type="text" 
                            name="username" 
                            placeholder="Username" 
                            className={`input ${fieldErrors.username ? 'input-error' : ''}`} 
                            value={formData.username} 
                            onChange={handleChange}
                            disabled={isSubmitting}
                            aria-label="Username"
                            arai-invalid={!!fieldErrors.username}
                            aria-describedby={fieldErrors.username ? "username-error" : undefined}
                        /> 
                        {fieldErrors.username && (
                            <p id="username-error" className="field-error" role="alert">
                                {fieldErrors.username}
                            </p>
                        )}
                    </div>

                    <div className="form-field">
                        <input 
                            type="email" 
                            name="email" 
                            placeholder="Email" 
                            className={`input ${fieldErrors.email ? 'input-error' : ''}`} 
                            value={formData.email} 
                            onChange={handleChange}
                            disabled={isSubmitting}
                            aria-label="Email"
                            arai-invalid={!!fieldErrors.email}
                            aria-describedby={fieldErrors.email ? "email-error" : undefined}
                        /> 
                        {fieldErrors.email && (
                            <p id="email-error" className="field-error" role="alert">
                                {fieldErrors.email}
                            </p>
                        )}
                    </div>
                    

                    <div className="form-field">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            name="password" 
                            placeholder="Password" 
                            className={`input ${fieldErrors.password ? 'input-error' : ''}`} 
                            value={formData.password} 
                            onChange={handleChange}
                            disabled={isSubmitting}
                            aria-label="Password"
                            arai-invalid={!!fieldErrors.password}
                            aria-describedby={fieldErrors.password ? "password-error" : undefined}
                        /> 

                        {formData.password && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(prev => !prev)}
                            className="show-password-button"
                            tabIndex={-1}
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                        )}
                        
                        {fieldErrors.password && (
                            <p id="password-error" className="field-error" role="alert">
                                {fieldErrors.password}
                            </p>
                        )}
                    </div>
                    
                    <button 
                        type="submit" 
                        className="summit-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'CREATING ACCOUNT...' : 'CREATE AN ACOUNT'}
                    </button>
                </form>

                {alert.message && (
                    <div
                        className={`alert alert-${alert.type}`}
                        role="alert"
                        aria-live="polite"
                    >
                        {alert.message}
                    </div>
                )}
            </div>

            <p className="guest-text">Or you want to take a look first?</p>
            <button 
                className="guest-button" 
                onClick={handleGuestClick}
                disabled={isSubmitting}
            >
                CONTINUE AS GUEST
            </button>
        </div>
    );
};
export default SignUpPage;