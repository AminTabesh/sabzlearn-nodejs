import { useState } from "react";
import { AuthApiError, submitAuth } from "./authApi.js";
import { emptyRegister, loginPayload, registerPayload } from "./authPayload.js";

export default function useAuthForm(onAuthenticated) {
  const [mode, setMode] = useState("login");
  const [identifier, setIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [register, setRegister] = useState(emptyRegister);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
  }

  function changeIdentifier(event) {
    setIdentifier(event.target.value);
    setError("");
  }

  function changeLoginPassword(event) {
    setLoginPassword(event.target.value);
    setError("");
  }

  function changeRegister(event) {
    const { name, value } = event.target;
    setRegister((current) => ({ ...current, [name]: value }));
    setError("");
  }

  async function submit(event) {
    event.preventDefault();
    if (loading) return;
    setError("");

    let body;
    if (mode === "register") {
      if (register.password !== register.passwordConfirm) {
        setError("تکرار رمز عبور با رمز عبور یکسان نیست.");
        return;
      }
      body = registerPayload(register);
    } else {
      if (!identifier.trim()) {
        setError("نام کاربری یا ایمیل خود را وارد کنید.");
        return;
      }
      body = loginPayload(identifier, loginPassword);
    }

    setLoading(true);
    try {
      onAuthenticated(await submitAuth(mode, body));
    } catch (caught) {
      setError(caught instanceof AuthApiError
        ? caught.message
        : "ارتباط با سرور برقرار نشد. لطفاً اتصال خود را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  }

  return {
    mode, identifier, loginPassword, register, error, loading,
    switchMode, changeIdentifier, changeLoginPassword, changeRegister, submit,
  };
}
