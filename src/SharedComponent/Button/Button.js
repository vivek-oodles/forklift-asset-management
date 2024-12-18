import React from "react";
import style from "./style.module.css";

const Button = (props) => {
  const { text, menus, onClick, variant, ...prop } = props;

  const handleClick = (item, i) => {
    if (text) {
      onClick();
    } else {
      onClick(item, i);
    }
  };

  if (text) {
    return (
      <button
        className={`
          ${style["btn"]} 
          ${variant === "outline" && style["outline"]}
          ${variant === "close" && style["close"]}
          ${style["single-button"]}
        `}
        onClick={handleClick}
        {...prop}
      >
        {text}
      </button>
    );
  }

  return (
    <div className={style["button-group"]}>
      {menus?.map((item, i) => {
        return (
          <button
            key={i}
            className={style["btn"]}
            onClick={() => handleClick(item, i)}
            {...prop}
          >
            {item.text}
          </button>
        );
      })}
    </div>
  );
};

export default Button;
