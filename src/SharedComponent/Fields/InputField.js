import React, { useMemo } from "react";
import style from "./style.module.css";

const InputField = (props) => {
  const { name, value, onChange, label, placeholder, required, type, errors } =
    props;

  const handleChange = (e) => {
    let value = e.target.value;
    if (value && type === "number") {
      value = parseInt(e.target.value) || 0;
    }
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
      <input
        type={type || "text"}
        value={value}
        onChange={handleChange}
        className={style["input"]}
        required={required}
        placeholder={placeholder}
      />
      {hasError && (
        <div className={style["error-message"]}>{errors?.[name]}</div>
      )}
    </div>
  );
};

export default InputField;
