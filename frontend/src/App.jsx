import AuthScreen from "./features/auth/AuthScreen.jsx";
import ProfileScreen from "./features/profile/ProfileScreen.jsx";
import useSession from "./hooks/useSession.js";

export default function App() {
  const { session, authenticate, logout } = useSession();

  return session
    ? <ProfileScreen user={session.user} onLogout={logout} />
    : <AuthScreen onAuthenticated={authenticate} />;
}
