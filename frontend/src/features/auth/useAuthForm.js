import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { submitAuth } from "./authApi.js";
import { emptyRegister, loginPayload, registerPayload } from "./authPayload.js";

export default function useAuthForm(onAuthenticated) {
  const [mode, setMode] = useState("login");
  const [identifier, setIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [register, setRegister] = useState(emptyRegister);
  const lock = useRef(false);
  const [loading, setLoading] = useState(false);

  function switchMode(nextMode) {
    setMode(nextMode);
  }

  function changeIdentifier(event) {
    setIdentifier(event.target.value);
  }

  function changeLoginPassword(event) {
    setLoginPassword(event.target.value);
  }

  function changeRegister(event) {
    const { name, value } = event.target;
    setRegister((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    if (lock.current) return;

    let body;
    if (mode === "register") {
      if (register.password !== register.passwordConfirm) {
        toast.error("تکرار رمز عبور با رمز عبور یکسان نیست.");
        return;
      }
      body = registerPayload(register);
    } else {
      if (!identifier.trim()) {
        toast.error("نام کاربری یا ایمیل خود را وارد کنید.");
        return;
      }
      body = loginPayload(identifier, loginPassword);
    }

    lock.current = true;
    setLoading(true);
    const pending = toast.loading("در حال بررسی اطلاعات…");
    try {
      onAuthenticated(await submitAuth(mode, body));
      toast.success("به رستا خوش آمدی.", { id: pending });
    } catch (caught) {
      toast.error(caught.message, { id: pending });
    } finally {
      lock.current = false;
      setLoading(false);
    }
  }

  return {
    mode,
    identifier,
    loginPassword,
    register,
    loading,
    switchMode,
    changeIdentifier,
    changeLoginPassword,
    changeRegister,
    submit,
  };
}
