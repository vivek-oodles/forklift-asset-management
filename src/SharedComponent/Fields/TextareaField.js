import React, { useMemo } from "react";
import style from "./style.module.css";

const TextareaField = (props) => {
  const {
    name,
    value,
    onChange,
    label,
    placeholder,
    required,
    rows = 2,
    errors,
  } = props;

  const handleChange = (e) => {
    onChange({ target: { name, value: e.target.value } });
  };

  const hasError = useMemo(() => {
    return errors?.[name];
  }, [errors, name]);

  return (
    <div className={`${style["form-group"]} ${hasError && style.error}`}>
      <div className={style["label"]}>
        {label} {required && <span style={{ color: "red" }}>*</span>}
      </div>
      <textarea
        value={value}
        onChange={handleChange}
        rows={rows}
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

export default TextareaField;
