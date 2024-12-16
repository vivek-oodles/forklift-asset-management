import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';

const NewPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false); // State for loading
  const navigate = useNavigate();

  const { uidb64, token } = useParams();

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid:
        password.length >= minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumber &&
        hasSpecialChar,
      message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
    };
  };

  const handleNewPasswordSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setErrorMessage(passwordValidation.message);
      return;
    }

    setLoading(true); // Start loading

    try {
      const response = await fetch(`http://127.0.0.1:8000/reset-password/${uidb64}/${token}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || 'An error occurred. Please try again.';
        setErrorMessage(errorMessage);
        return;
      }

      setSuccessMessage('Password reset successful. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Network error. Please try again.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ maxWidth: '400px', borderRadius: '10px' }}>
        <h2 className="text-center mb-4" style={{ fontWeight: 'bold', color: '#343a40' }}>
          Reset Password
        </h2>
        <form onSubmit={handleNewPasswordSubmit}>
          <div className="mb-3">
            <label htmlFor="newPassword" className="form-label">
              <FaLock className="me-2" /> New Password
            </label>
            <input
              type="password"
              className="form-control"
              id="newPassword"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <small className="form-text text-muted">
              Password must include uppercase, lowercase, number, and special character.
            </small>
          </div>
          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">
              <FaLock className="me-2" /> Confirm New Password
            </label>
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {errorMessage && <div className="alert alert-danger text-center">{errorMessage}</div>}
          {successMessage && <div className="alert alert-success text-center">{successMessage}</div>}
          <button type="submit" className="btn btn-primary w-100 mt-3" disabled={loading}>
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
        <p className="text-center mt-3">
          <a href="/login" className="text-primary" style={{ textDecoration: 'none', fontWeight: '500' }}>
            Back to Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default NewPassword;
