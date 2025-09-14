import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../css/ResetPassword.css'; // ใช้ CSS เดิมได้เลย
import logo from '../image/Logo2.png';
import axios from 'axios';

const NewPasswordPage = () => {
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const validateField = (name, value) => {
    if (name === 'password') {
      if (!value.trim()) return 'Password is required';
      if (value.length < 6) return 'Password must be at least 6 characters';
    }
    if (name === 'confirmPassword') {
      if (!value.trim()) return 'Please confirm your password';
      if (value !== formData.password) return 'Passwords do not match';
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

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    } else if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
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
      // ตัวอย่างเรียก API สำหรับ reset password ใหม่
      const res = await axios.post('/api/auth/new-password', { password: formData.password });
      setMessage(res.data?.message || 'Your password has been reset successfully!');
      setFormData({ password: '', confirmPassword: '' });
      setTouched({});
      setTimeout(() => navigate('/login'), 2000); // กลับไปหน้า login หลัง 2 วินาที
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

  return (
    <div className="reset-container">
      <div className="logo-header">
        <img src={logo} alt="Company Logo" className="Logo" />
      </div>

      <div className="reset-card">
        <div className="reset-header">
          <h1 className="reset-title">SET NEW PASSWORD</h1>
          <p className="reset-subtitle">
            Please enter your new password and confirm it below.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Password */}
          <label className="reset-label" htmlFor="password">New Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="Enter new password"
            className={getInputClasses('password')}
            aria-describedby={errors.password ? 'password-error' : undefined}
            aria-invalid={errors.password ? 'true' : 'false'}
            disabled={isLoading}
          />
          {errors.password && <div id="password-error" className="login-error">{errors.password}</div>}

          {/* Confirm Password */}
          <label className="reset-label" htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="Confirm new password"
            className={getInputClasses('confirmPassword')}
            aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
            aria-invalid={errors.confirmPassword ? 'true' : 'false'}
            disabled={isLoading}
          />
          {errors.confirmPassword && <div id="confirm-error" className="login-error">{errors.confirmPassword}</div>}

          {/* Success Message */}
          {message && <div className="login-success">{message}</div>}
          {errors.submit && <div className="login-error">{errors.submit}</div>}

          {/* Submit Button */}
          <button
            type="submit"
            className="send-reset-button"
            disabled={!formData.password || !formData.confirmPassword || !!errors.password || !!errors.confirmPassword || isLoading}
          >
            {isLoading ? 'Saving...' : 'Save New Password'}
          </button>

          <div className="reset-link">
            <Link to="/login" className="login-link-text">Back to Sign In</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPasswordPage;
