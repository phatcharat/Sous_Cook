import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../css/ResetPassword.css';
import logo from '../image/Logo2.png';
import axios from 'axios';

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({ email: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Validation rules
  const validateField = (name, value) => {
    if (name === 'email') {
      if (!value.trim()) return 'Email is required';
      if (!/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email address';
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
      setTouched({ email: true });
      return;
    }

    setIsLoading(true);
    setErrors({});
    setMessage('');
    try {
      // ✅ Call API backend reset password
      const res = await axios.post('/api/auth/reset-password', {
        email: formData.email,
      });

      setMessage(res.data?.message || 'Password reset link sent to your email!');
      setFormData({ email: '' });
      setTouched({});
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
    const hasError = errors[fieldName];
    return hasError ? `${baseClasses} login-input-error` : baseClasses;
  };

  return (
    <div className="reset-container">
  {/* Header */}
  <div className="logo-header">
    <img 
      src={logo} 
      alt="Company Logo" 
      className="Logo"
    />
  </div>

  <div className="reset-card">
    <div className="reset-header">
      <h1 className="reset-title">RESET YOUR PASSWORD</h1>
      <p className="reset-subtitle">
        Don't worry! It happens. Please enter your email, you will soon receive a password reset link.
      </p>
    </div>

    <form onSubmit={handleSubmit}>
      {/* Email Field */}
      <label className="reset-label" htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder="Enter your email"
        className={getInputClasses('email')}
        aria-describedby={errors.email ? 'email-error' : undefined}
        aria-invalid={errors.email ? 'true' : 'false'}
        autoComplete="email"
        disabled={isLoading}
      />
      {errors.email && (
        <div id="email-error" className="login-error" role="alert">
          {errors.email}
        </div>
      )}

      {/* Success Message */}
      {message && (
        <div className="login-success" role="alert">
          {message}
        </div>
      )}

      {/* Submit Error */}
      {errors.submit && (
        <div className="login-error" role="alert">
          {errors.submit}
        </div>
      )}

      {/* Submit Button */}
      <button 
        type="submit" 
        className="send-reset-button" 
        disabled={!formData.email || !!errors.email || isLoading}
      >
        {isLoading ? 'Sending...' : 'Send Reset Link'}
      </button>

      {/* Back to Login Link (now inside the form, under button) */}
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

export default ResetPasswordPage;
