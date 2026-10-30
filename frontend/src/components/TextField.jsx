import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import Icon from "./Icon.jsx";

export default function TextField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  inputMode,
  required = true,
  note,
  minLength,
  maxLength,
}) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="field-wrap">
      <Label htmlFor={id} className="field-label">
        {label}
      </Label>
      <div className="field-control">
        <Input
          id={id}
          name={id}
          type={isPassword && visible ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          dir={
            type === "email" || type === "tel" || isPassword ? "ltr" : "auto"
          }
          className="field-input"
        />
        {isPassword && (
          <button
            type="button"
            className="visibility-button"
            onClick={() => setVisible(!visible)}
            aria-label={visible ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
            aria-pressed={visible}
          >
            <Icon name={visible ? "eyeOff" : "eye"} size={19} />
          </button>
        )}
      </div>
      {note && <span className="field-note">{note}</span>}
    </div>
  );
}
