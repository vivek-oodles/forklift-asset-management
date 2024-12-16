import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope } from 'react-icons/fa';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false); // State for loading spinner
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|io|co\.in)$/;
    return emailRegex.test(email);
  };

  const handleResetPasswordRequest = async (e) => {
    e.preventDefault();

    // Validate email
    if (!validateEmail(email)) {
      setErrorMessage(
        'Please enter a valid email address with domains like .com, .io, or .co.in.'
      );
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true); // Show loader during API call

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/reset-password/<uidb64>/<token>/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Password reset link sent:', data);
        setSuccessMessage('Password reset instructions have been sent to your email.');
        setErrorMessage('');
        setEmail(''); // Clear email field on success
      } else {
        const error = await response.json();
        setErrorMessage(error.detail || 'Failed to send password reset link.');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Something went wrong. Please try again later.');
    } finally {
      setLoading(false); // Hide loader after API call
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center mb-4" style={{ fontWeight: 'bold' }}>Reset Password</h2>
        <form onSubmit={handleResetPasswordRequest}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              <FaEnvelope className="me-2" /> Email Address
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <small className="form-text text-muted">
              Enter the email associated with your account
            </small>
          </div>
          
          {errorMessage && (
            <div className="alert alert-danger text-center p-2" role="alert">
              {errorMessage}
            </div>
          )}
          
          {successMessage && (
            <div className="alert alert-success text-center p-2" role="alert">
              {successMessage}
            </div>
          )}
          
          <button 
            type="submit" 
            className="btn btn-primary w-100 mt-3" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Sending...
              </>
            ) : (
              'Send Password Reset Link'
            )}
          </button>
        </form>
        
        <p className="text-center mt-3">
          <button 
            onClick={() => navigate('/login')} 
            className="btn btn-link text-primary" 
            style={{ textDecoration: 'none', padding: 0 }}
          >
            Back to Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
