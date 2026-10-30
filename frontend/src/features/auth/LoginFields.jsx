import TextField from "../../components/TextField.jsx";

export default function LoginFields({
  identifier,
  password,
  onIdentifierChange,
  onPasswordChange,
}) {
  return (
    <>
      <TextField
        id="identifier"
        label="نام کاربری یا ایمیل"
        value={identifier}
        onChange={onIdentifierChange}
        placeholder="نام کاربری یا ایمیلت را بنویس"
        autoComplete="username"
      />
      <TextField
        id="loginPassword"
        label="رمز عبور"
        type="password"
        value={password}
        onChange={onPasswordChange}
        placeholder="رمز عبورت را وارد کن"
        autoComplete="current-password"
      />
    </>
  );
}
