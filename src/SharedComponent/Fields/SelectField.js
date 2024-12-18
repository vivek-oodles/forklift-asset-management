import React, { useMemo } from "react";
import style from "./style.module.css";

const SelectField = (props) => {
  const { name, value, onChange, label, menus, placeholder, required, errors } =
    props;

  const handleChange = (e) => {
    let value = e.target.value;
    onChange({ target: { name, value } });
  };

  const hasError = useMemo(() => {
    return errors?.[name];
  }, [errors, name]);

  return (
    <div className={`${style["form-group"]} ${hasError && style.error}`}>
      <div className={style["label"]}>
        {label} {required && <span style={{ color: "red" }}>*</span>}
      </div>
      <select
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={style["input"]}
      >
        {menus?.map((item, i) => {
          return (
            <option key={i} value={item.value}>
              {item.option}
            </option>
          );
        })}
      </select>
      {/* <input
        type={type || "text"}
        value={value}
        onChange={handleChange}
        className={style["input"]}
        required={required}
        placeholder={placeholder}
      /> */}
      {hasError && (
        <div className={style["error-message"]}>{errors?.[name]}</div>
      )}
    </div>
  );
};

export default SelectField;
