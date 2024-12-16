import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { API_END_POINTS } from '../../../network/apiEndPoint';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|io|co\.in)$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setErrorMessage(
        'Please enter a valid email address with domains like .com, .io, or .co.in.'
      );
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const response = await fetch(API_END_POINTS.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("->",data)

      if (response.ok) {
        // Save tokens and user info to localStorage
        localStorage.setItem('refresh', data.refresh);
        localStorage.setItem('access', data.access);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('name', data.name); // Store the name from response
        localStorage.setItem('userEmail', email); // Store email as well
        navigate('/dashboard', {state:{role:data.role}})
        // Navigate based on user role
        setLoading(false);
        // // switch (data.role) {
        // //   case 'admin':
        // //     navigate('/admin/dashboard');
        // //     break;
        // //   case 'customer_manager':
        // //     navigate('/dashboard/customer-manager');
        // //     break;
        // //   case 'ticket_manager':
        // //     navigate('/dashboard/ticket-manager');
        // //     break;
        // //   case 'sales_manager':
        // //     navigate('/dashboard/sales-manager');
        // //     break;
        // //   case 'user':
        // //       navigate('/dashboard/user');
        // //       break;
        // //   default:
        // //     navigate('/dashboard');
        // // }
      } else {
        // Handle errors from the API
        setErrorMessage(data.error || 'Invalid email or password.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Something went wrong. Please try again later.');
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center mb-4" style={{ fontWeight: 'bold' }}>Login</h2>
        <form onSubmit={handleSubmit}>
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
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              <FaLock className="me-2" /> Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {errorMessage && (
            <div className="alert alert-danger text-center p-2" role="alert">
              {errorMessage}
            </div>
          )}
          <button type="submit" className="btn btn-primary w-100 mt-3" disabled={loading}>
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
        <p className="text-center mt-3">
          <a href="/reset-password" className="text-primary" style={{ textDecoration: 'none' }}>
            Forgot Password?
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
