import React, { useEffect, useState } from "react";
import AdminDashboard from "./AdminDashboard";
import AssetManagerDashboard from "./AssetManagerDashboard";
import CustomerManagerDashboard from "./CustomerManagerDashboard";
import UserDashboard from "./UserDashboard";
// import { useLocation } from "react-router-dom";

export const DashboardCommon = () => {
  // const location = useLocation()
  // const role = location.state.role;
  const role = localStorage.getItem("userRole");

  return (
    <div id="dashboard">
      {
        role === "admin" ? (
          <AdminDashboard /> //admin component
        ) : role === "asset_manager" ? (
          <AssetManagerDashboard /> //asset manager component
        ) : // role === 'new'? //comp:
        role === "customer_manager" ? (
          <CustomerManagerDashboard />
        ) : (
          <UserDashboard />
        ) //user Component
      }
    </div>
  );
};
