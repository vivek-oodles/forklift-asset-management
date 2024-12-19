import React, { useEffect, useState } from "react";
import AdminDashboard from "./AdminDashboard";
import AssetManagerDashboard from "./AssetManagerDashboard";
import CustomerManagerDashboard from "./CustomerManagerDashboard";

// import { useLocation } from "react-router-dom";

export const DashboardCommon = () => {
  // const location = useLocation()
  // const role = location.state.role;
  const role = localStorage.getItem("userRole");

  return (
    <div id="dashboard">
            {role === 'admin' ? (
                <AdminDashboard /> /* Admin component */
            ) : role === 'asset_manager' ? (
                <AssetManagerDashboard /> /* Asset Manager component */
            ) : role === 'customer_manager' ? (
                <CustomerManagerDashboard /> /* Customer Manager component */
            ) : 
            // role === 'Finance_Manager' ? (
            //     <FinanceManagerDashboard /> /* Finance Manager component */
            // ) : role === 'Warehouse_Manager' ? (
            //     <WarehouseManagerDashboard /> /* Warehouse Manager component */
            // ) :
           (
                <div>Role not recognized or no role provided</div> /* Fallback for unsupported roles */
            )}
        </div>
  );
};
