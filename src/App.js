import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import Login from './apps/tickets/pages/Auth/Login';
import Register from './apps/tickets/pages/Auth/Register';
import ResetPassword from './apps/tickets/pages/Auth/ResetPassword';
import NewPassword from './apps/tickets/pages/Auth/NewPassword';
import AdminDashboard from './apps/tickets/pages/Dashboard/AdminDashboard';
import AssetManagerDashboard from './apps/tickets/pages/Dashboard/AssetManagerDashboard';
import CustomerManagerDashboard from './apps/tickets/pages/Dashboard/CustomerManagerDashboard';
import './App.css';
import ProtectedRoute from './apps/tickets/routes/ProtectedRoute';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { useState, useEffect } from 'react';
import UserDashboard from './apps/tickets/pages/Dashboard/UserDashboard';
import SalesManagerDashboard from './apps/tickets/pages/Dashboard/SalesManagerDashboard';
import { useTranslation } from 'react-i18next';
// Layout wrapper component
import { DashboardCommon } from './apps/tickets/pages/Dashboard/DashboardCommon';

const Layout = ({ children }) => {
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('access') !== null;
  const isAuthPage = ['/login', '/register', '/reset-password', '/'].includes(location.pathname);

  return (
    <div className="app">
      {isLoggedIn && !isAuthPage && <Sidebar />}
      <div className={`main-wrapper ${isLoggedIn && !isAuthPage ? 'with-sidebar' : ''}`}>
        {isLoggedIn && !isAuthPage && <Navbar />}
        <main className={`main-content ${!isLoggedIn || isAuthPage ? 'auth-page' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password/:uidb64/:token" element={<NewPassword />} />
            
            <Route path ='/dashboard' element={<DashboardCommon/>}/>
            
            {/* Admin Routes */}
            {/* <Route path="/admin/*" element={
              <ProtectedRoute requiredPermission="canAccessAdmin">
                <AdminDashboard />
              </ProtectedRoute>
            } /> */}

            {/* Role-Based Routes */}
            {/* <Route path="/dashboard/*" element={
              <ProtectedRoute>
                <Routes>
                  <Route path="asset-manager" element={<AssetManagerDashboard />} />
                  <Route path="customer-manager" element={<CustomerManagerDashboard />} />
                  <Route path="user" element={<UserDashboard />} />
                  <Route path="sales-manager" element={<SalesManagerDashboard />} />
                </Routes>
              </ProtectedRoute>
            } />*/}
          </Routes> 
        </Layout>
      </Router>
    </Provider>
  );
};

export default App;
