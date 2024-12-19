import React, { useEffect, useMemo, useState } from "react";
import {
  FaCalendarAlt,
  FaCubes,
  FaExclamationTriangle,
  FaShieldAlt,
} from "react-icons/fa";
import style from "./style.module.css";
import { toast } from "react-toastify";
import { API_END_POINTS } from "../../network/apiEndPoint";
import { getProtected } from "../../network/ApiService";

const StatCard = () => {
  const [dashboardData, setDashboardData] = useState({});
  const role = localStorage.getItem("userRole");

  useEffect(() => {
    getDashboard();
  }, []);

  const getDashboard = async () => {
    try {
      const url = API_END_POINTS.dashboard;
      const response = await getProtected(url);
      if (response) {
        setDashboardData(response);
      }
    } catch (e) {
      console.log(e);
      const message = e?.response?.data?.messages;
      if (message && message?.[0]?.message) {
        toast.error(message[0].message);
      }
    }
  };

  const assetsItems = useMemo(() => {
    if (role !== "asset_manager") return [];
    if (!dashboardData) return [];
    return [
      {
        icon: FaCubes,
        value: dashboardData.total_assets || 0,
        label: "Total Asset",
        iconClass: "total",
      },
      {
        icon: FaCalendarAlt,
        value: dashboardData.assets_under_maintenance || 0,
        label: "Under Maintenance",
        iconClass: "new",
      },
      {
        icon: FaExclamationTriangle,
        value:
          dashboardData.assets_by_status?.find(
            (item) => item?.status === "Used"
          )?.count || 0,
        label: "Used assets",
        iconClass: "total",
      },
      {
        icon: FaShieldAlt,
        value:
          dashboardData.assets_by_status?.find(
            (item) => item?.status === "Miete"
          )?.count || 0,
        label: "Short Term Hired",
        iconClass: "total",
      },
    ];
  }, [dashboardData, role]);

  return (
    <div className={style["stats-grid"]}>
      {assetsItems?.map((item, index) => {
        return (
          <div
            key={index}
            className={style["stat-card"]}
            style={{ width: "25%" }}
          >
            <div className={`${style["stat-icon"]} ${style[item.iconClass]}`}>
              <item.icon style={{ width: "23px", height: "23px" }} />
            </div>
            <div className={style["stat-details"]}>
              <span className={style["stat-value"]}>{item.value}</span>
              <span className={style["stat-label"]}>{item.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default StatCard;
