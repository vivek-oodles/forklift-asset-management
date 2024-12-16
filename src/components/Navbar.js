import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FaTicketAlt,
  FaGlobe,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaUser,
  FaCog,
  FaUserCircle,
  FaChevronDown,
  FaTimes
} from 'react-icons/fa';
import './Navbar.css';
import { useState } from 'react';
import axios from 'axios';

const Navbar = () => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: '',
    category: '',
    customer_company: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    internal_notes: ''
  });
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userName = localStorage.getItem('name') || 'User';
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    newPasswordConfirm: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showLogoutLoader, setShowLogoutLoader] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('access') !== null;
  
  // Check if current path is login or register page
  const isAuthPage = ['/login'].includes(location.pathname);

  // Get user role from localStorage
  const userRole = localStorage.getItem('userRole');
  
  // Simplified navbar title based on role
  const navbarTitle = (() => {
    switch(userRole) {
      case 'admin':
        return t('dashboard.adminTitle');
      case 'ticket_manager':
        return t('dashboard.ticket_managerTitle');
      case 'customer_manager':
        return t('dashboard.customer_managerTitle');
      case 'sales_manager':
        return t('dashboard.sales_managerTitle');
      case 'user':
        return t('dashboard.userTitle');
      default:
        return t('dashboard.title');
    }
  })();

  const getCreateButtonText = () => {
    switch(userRole) {
      case 'admin':
        return 'Create Manager';
      case 'ticket_manager':
        return 'Create Ticket';
      case 'customer_manager':
        return 'Add Customer';
      case 'sales_manager':
        return 'Create Sales Ticket';
      case 'user':
        return 'Create Ticket';
      default:
        return 'Create';
    }
  };

  // Function to change the language
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  // Function to handle logout
  const handleLogout = async () => {
    // Get all dashboard components
    const dashboards = document.querySelectorAll('.dashboard-container');
    dashboards.forEach(dashboard => {
      const component = dashboard.__reactFiber$;
      if (component && component.setShowLogoutLoader) {
        component.setShowLogoutLoader(true);
      }
    });

    setIsLoggingOut(true);
    setShowLogoutLoader(true);
    
    try {
      const refreshToken = localStorage.getItem('refresh');
      const accessToken = localStorage.getItem('access');
      
      if (!refreshToken || !accessToken) {
        console.error('Token not found');
        alert("You are already logged out");
        navigate('/login');
        return;
      }

      const response = await fetch('http://127.0.0.1:8000/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      });

      if (response.ok) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('userRole');
        localStorage.removeItem('name');
        localStorage.removeItem('userEmail');
        navigate('/login');
      } else {
        const errorData = await response.json();
        console.error('Logout failed:', errorData);
        alert(`Logout failed: ${errorData.error || 'Unexpected error occurred'}`);
      }
    } catch (error) {
      console.error('Error logging out:', error);
      alert('An error occurred while logging out. Please try again.');
    } finally {
      setIsLoggingOut(false);
      setShowLogoutLoader(false);
      // Reset loader state in all dashboard components
      const dashboards = document.querySelectorAll('.dashboard-container');
      dashboards.forEach(dashboard => {
        const component = dashboard.__reactFiber$;
        if (component && component.setShowLogoutLoader) {
          component.setShowLogoutLoader(false);
        }
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTicket(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    // Add your API call here to submit the ticket
    console.log('New Ticket:', newTicket);
    setShowTicketModal(false);
    // Reset form
    setNewTicket({
      title: '',
      description: '',
      priority: '',
      category: '',
      customer_company: '',
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      internal_notes: ''
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.newPasswordConfirm) {
      alert('New passwords do not match!');
      return;
    }

    setIsChangingPassword(true);
    const token = localStorage.getItem('access');

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/update-password/',
        {
          old_password: passwordData.oldPassword,
          new_password: passwordData.newPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.message === "Password changed successfully") {
        alert('Password changed successfully!');
        setShowChangePasswordModal(false);
        // Reset form
        setPasswordData({
          oldPassword: '',
          newPassword: '',
          newPasswordConfirm: ''
        });
      }
    } catch (error) {
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Failed to change password. Please try again.');
      }
      console.error('Error changing password:', error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Update userProfile to use the name from localStorage
  const userProfile = {
    name: localStorage.getItem('name') || 'User',
    email: localStorage.getItem('userEmail'),
    role: (() => {
      const role = localStorage.getItem('userRole');
      switch(role) {
        case 'admin':
          return 'Administrator';
        case 'ticket_manager':
          return 'Ticket Manager';
        case 'customer_manager':
          return 'Customer Manager';
        case 'sales_manager':
          return 'Sales Manager';
        case 'user':
          return 'User';
        default:
          return 'User';
      }
    })()
  };

  // Add these language options
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isLanguageDropdownOpen && !event.target.closest('.language-dropdown-container')) {
        setIsLanguageDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLanguageDropdownOpen]);

  // Post-login dashboard navbar
  if (showLogoutLoader) {
    return (
      <div className="loader-overlay">
        <div className="loader-content">
          <div className="modern-loader"></div>
          <div className="loader-text">Logging out...</div>
        </div>
      </div>
    );
  }

  return (
    <header className="dashboard-header bg-white shadow-sm">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center h-100">
          {/* Left side - Logo and Title */}
          <Link className="navbar-brand d-flex align-items-center">
            <FaTicketAlt className="text-primary me-2" />
            <span className="fw-bold text-primary">
              {navbarTitle}
            </span>
          </Link>

          {/* Right side - All Actions */}
          <div className="navbar-actions">
            {/* Language Dropdown */}
            <div className="language-dropdown-container">
              <button 
                className="action-icon-btn"
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              >
                <FaGlobe className="action-icon" />
              </button>
              
              {isLanguageDropdownOpen && (
                <div className="language-dropdown">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      className={`language-option ${i18n.language === lang.code ? 'active' : ''}`}
                      onClick={() => {
                        i18n.changeLanguage(lang.code);
                        setIsLanguageDropdownOpen(false);
                      }}
                    >
                      <span className="language-flag">{lang.flag}</span>
                      <span className="language-name">{lang.name}</span>
                      {i18n.language === lang.code && (
                        <span className="check-mark">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="user-dropdown" onClick={() => setShowUserDropdown(!showUserDropdown)}>
              <button className="user-dropdown-btn">
                <FaUserCircle className="user-icon" />
                <span className="user-name">{userName}</span>
                <FaChevronDown className="dropdown-arrow" />
              </button>
              
              {showUserDropdown && (
                <div className="dropdown-menu show">
                  <div className="dropdown-header">
                    <div className="header-profile">
                      <FaUserCircle className="header-profile-icon" />
                      <div className="header-info">
                        <span className="user-full-name">{userProfile.name}</span>
                        <span className="user-designation">{userProfile.role}</span>
                        {userProfile.email && <span className="user-email">{userProfile.email}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button
                    onClick={() => setShowChangePasswordModal(true)}
                    className="dropdown-item"
                  >
                    <FaCog className="dropdown-icon" />
                    {t('navbar.changePassword')}
                  </button>
                  <div className="dropdown-divider"></div>
                  <button 
                    onClick={handleLogout} 
                    className="dropdown-item text-danger"
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <div className="logout-loader-container">
                        <div className="modern-loader"></div>
                        <span>{t('navbar.logout')}</span>
                      </div>
                    ) : (
                      <>
                        <FaSignOutAlt className="dropdown-icon" />
                        {t('navbar.logout')}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Ticket Modal */}
      {showTicketModal && (
        <div className="modal-backdrop">
          <div className="simple-modal">
            <div className="modal-header">
              <h5>{t('ticketForm.title')}</h5>
              <button 
                type="button" 
                className="close-btn" 
                onClick={() => setShowTicketModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmitTicket}>
              <div className="modal-content">
                {/* Basic Ticket Info */}
                <div className="form-group">
                  <label>{t('ticketForm.fields.title')} <span className="required">{t('common.required')}</span></label>
                  <input
                    type="text"
                    name="title"
                    className="form-input"
                    placeholder="Enter ticket title"
                    value={newTicket.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description <span className="required">*</span></label>
                  <textarea
                    name="description"
                    className="form-input"
                    placeholder="Enter detailed description"
                    rows="3"
                    value={newTicket.description}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Priority <span className="required">*</span></label>
                    <select
                      name="priority"
                      className="form-input"
                      value={newTicket.priority}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Priority</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Category <span className="required">*</span></label>
                    <select
                      name="category"
                      className="form-input"
                      value={newTicket.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Hardware Issue">Hardware Issue</option>
                      <option value="Software Issue">Software Issue</option>
                      <option value="Network Issue">Network Issue</option>
                      <option value="Access Issue">Access Issue</option>
                    </select>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Company Name <span className="required">*</span></label>
                    <input
                      type="text"
                      name="customer_company"
                      className="form-input"
                      placeholder="Enter company name"
                      value={newTicket.customer_company}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Contact Person <span className="required">*</span></label>
                    <input
                      type="text"
                      name="customer_name"
                      className="form-input"
                      placeholder="Enter contact name"
                      value={newTicket.customer_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number <span className="required">*</span></label>
                    <input
                      type="tel"
                      name="customer_phone"
                      className="form-input"
                      placeholder="Enter phone number"
                      value={newTicket.customer_phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email <span className="required">*</span></label>
                    <input
                      type="email"
                      name="customer_email"
                      className="form-input"
                      placeholder="Enter email address"
                      value={newTicket.customer_email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Internal Notes</label>
                  <textarea
                    name="internal_notes"
                    className="form-input"
                    placeholder="Add any internal notes or comments"
                    rows="2"
                    value={newTicket.internal_notes}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setShowTicketModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-create"
                >
                  {t('ticketForm.buttons.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="modal-backdrop">
          <div className="modal-content password-modal">
            <div className="modal-header">
              <h2>{t('passwordModal.title')}</h2>
              <button 
                className="close-button"
                onClick={() => setShowChangePasswordModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmitPasswordChange}>
              <div className="modal-body">
                <div className="form-group">
                  <label>{t('passwordModal.currentPassword')} *</label>
                  <div className="password-input-wrapper">
                    <input
                      type="password"
                      name="oldPassword"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordChange}
                      required
                      placeholder="Enter current password"
                      minLength="8"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>{t('passwordModal.newPassword')} *</label>
                  <div className="password-input-wrapper">
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      placeholder="Enter new password"
                      minLength="8"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>{t('passwordModal.confirmPassword')} *</label>
                  <div className="password-input-wrapper">
                    <input
                      type="password"
                      name="newPasswordConfirm"
                      value={passwordData.newPasswordConfirm}
                      onChange={handlePasswordChange}
                      required
                      placeholder="Confirm new password"
                      minLength="8"
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowChangePasswordModal(false)}
                  disabled={isChangingPassword}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      {t('passwordModal.buttons.changing')}
                    </>
                  ) : (
                    t('passwordModal.buttons.change')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
