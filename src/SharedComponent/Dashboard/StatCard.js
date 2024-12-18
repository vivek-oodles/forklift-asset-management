import React from "react";
import { FaCubes } from "react-icons/fa";
import style from "./style.module.css";

const StatCard = (props) => {
  const { icon: Icon, value, iconClass, label } = props;
  return (
    <div className={style["stat-card"]}>
      <div className={`${style["stat-icon"]} ${style[iconClass]}`}>
        <Icon />
      </div>
      <div className="stat-details">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
};
export default StatCard;
