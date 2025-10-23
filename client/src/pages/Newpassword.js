import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import '../css/ResetPassword.css';
import logo from '../image/Logo1.svg';
import axios from 'axios';

const NewPasswordPage = () => {
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [message, setMessage] = useState('');
  const [tokenValid, setTokenValid] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false);
        return;
      }

      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/auth/verify-reset-token/${token}`);
        if (res.data.valid) {
          setTokenValid(true);
          setUserEmail(res.data.email);
        } else {
          setTokenValid(false);
        }
      } catch (error) {
        setTokenValid(false);
      }
    };

    verifyToken();
  }, [token]);

  const validateField = (name, value) => {
    if (name === 'password') {
      if (!value) return 'Password is required';
      if (value.length < 8) return 'Password must be at least 8 characters';
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) 
        return 'Password must contain uppercase, lowercase, and number';
      return '';
    }
    if (name === 'confirmPassword') {
      if (!value.trim()) return 'Please confirm your password';
      if (value !== formData.password) return 'Passwords do not match';
      return '';
    }
    return '';
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }

    if (name === 'password' && touched.confirmPassword && formData.confirmPassword) {
      const confirmError = validateField('confirmPassword', formData.confirmPassword);
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setTouched({ password: true, confirmPassword: true });
      return;
    }

    setIsLoading(true);
    setErrors({});
    setMessage('');

    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/new-password`, {
        token: token,
        password: formData.password,
      });

      setMessage(res.data?.message || 'Your password has been reset successfully!');
      setFormData({ password: '', confirmPassword: '' });
      setTouched({});
      
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || 'An error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClasses = (fieldName) => {
    const baseClasses = 'login-input';
    return errors[fieldName] ? `${baseClasses} login-input-error` : baseClasses;
  };

  if (tokenValid === null) {
    return (
      <div className="reset-container">
        <div className="logo-header">
          <div className="logo-circle">
            <img src={logo} alt="Company Logo" className="Logo" />
          </div>
        </div>
        <div className="reset-card">
          <div className="reset-header">
            <h1 className="reset-title">Verifying Link...</h1>
            <p className="reset-subtitle">Please wait while we verify your reset link.</p>
          </div>
        </div>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="reset-container">
        <button
          className="back-arrow"
          onClick={() => navigate('/login')}
          aria-label="Go back to login"
        >
          ‹
        </button>

        <div className="logo-header">
          <div className="logo-circle">
            <img src={logo} alt="Company Logo" className="Logo" />
          </div>
        </div>
        <div className="reset-card">
          <div className="reset-header">
            <h1 className="reset-title">Invalid Link</h1>
            <p className="reset-subtitle">
              This password reset link is invalid or has expired.
            </p>
          </div>
          <div className="reset-link">
            <Link to="/reset-password" className="login-link-text">
              Request New Reset Link
            </Link>
          </div>
          <div className="reset-link">
            <Link to="/login" className="login-link-text">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-container">
      <button
        className="back-arrow"
        onClick={() => navigate('/login')}
        aria-label="Go back to login"
      >
        ‹
      </button>

      <div className="logo-header">
        <div className="logo-circle">
          <img
            src={logo}
            alt="Company Logo"
            className="Logo"
          />
        </div>
      </div>

      <div className="reset-card">
        <div className="reset-header">
          <h1 className="reset-title">SET NEW PASSWORD</h1>
          <p className="reset-subtitle">
            {userEmail && `Setting new password for ${userEmail}`}
          </p>
          <p className="reset-subtitle">
            Please enter your new password and confirm it below.
          </p>
        </div>

        <form className="reset" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="New Password"
              className={getInputClasses('password')}
              aria-describedby={errors.password ? 'password-error' : undefined}
              aria-invalid={errors.password ? 'true' : 'false'}
              autoComplete="new-password"
              disabled={isLoading}
            />
            {errors.password && (
              <div id="password-error" className="login-error" role="alert">
                {errors.password}
              </div>
            )}
          </div>

          <div className="input-wrapper">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="Confirm Password"
              className={getInputClasses('confirmPassword')}
              aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
              aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              autoComplete="new-password"
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <div id="confirm-error" className="login-error" role="alert">
                {errors.confirmPassword}
              </div>
            )}
          </div>

          {message && (
            <div className="login-success" role="alert">
              {message}
            </div>
          )}

          {errors.submit && (
            <div className="login-error" role="alert">
              {errors.submit}
            </div>
          )}

          <button
            type="submit"
            className="send-reset-button"
            disabled={
              !formData.password || 
              !formData.confirmPassword || 
              !!errors.password || 
              !!errors.confirmPassword || 
              isLoading
            }
          >
            {isLoading ? 'Saving...' : 'Save New Password'}
          </button>

          <div className="reset-link">
            <Link to="/login" className="login-link-text">
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPasswordPage;