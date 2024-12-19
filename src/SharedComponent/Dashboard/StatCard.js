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
  const [dashboardData, setDashboardData] = useState({
    total_assets: 0,
    assets_under_maintenance: 0,
    used_status: 0,
    miete: 0,
  });

  useEffect(() => {
    getDashboard();
  }, []);

  const getDashboard = async () => {
    try {
      const url = API_END_POINTS.dashboard;
      const response = await getProtected(url);
      if (response) {
        setDashboardData({
          total_assets: response?.total_assets,
          assets_under_maintenance: response?.assets_under_maintenance,
          used_status:
            response?.assets_by_status?.find((item) => item?.status === "Used")
              ?.count || 0,
          miete:
            response?.assets_by_status?.find((item) => item?.status === "Miete")
              ?.count || 0,
        });
      }
    } catch (e) {
      console.log(e);
      const message = e?.response?.data?.messages;
      if (message && message?.[0]?.message) {
        toast.error(message[0].message);
      }
    }
  };

  const dashboardItems = useMemo(() => {
    return [
      {
        icon: FaCubes,
        value: dashboardData.total_assets,
        label: "Total Asset",
        iconClass: "total",
      },
      {
        icon: FaCalendarAlt,
        value: dashboardData.assets_under_maintenance,
        label: "Under Maintenance",
        iconClass: "new",
      },
      {
        icon: FaExclamationTriangle,
        value: dashboardData.used_status,
        label: "Used assets",
        iconClass: "total",
      },
      {
        icon: FaShieldAlt,
        value: dashboardData.miete,
        label: "Short Term Hired",
        iconClass: "total",
      },
    ];
  }, [dashboardData]);

  return (
    <div className={style["stats-grid"]}>
      {dashboardItems?.map((item, index) => {
        return (
          <div key={index} className={style["stat-card"]} style={{width:"25%"}}>
            <div className={`${style["stat-icon"]} ${style[item.iconClass]}`}>
              <item.icon style={{width:"23px", height:"23px"}} />
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