import React from 'react';
import './Loader.css';

export const DashboardLoader = ({ message = "Loading..." }) => (
  <div className="loader-overlay">
    <div className="loader-content">
      <div className="modern-loader"></div>
      <div className="loader-text">{message}</div>
    </div>
  </div>
); 