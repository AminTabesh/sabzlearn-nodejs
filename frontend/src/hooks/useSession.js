import { useState } from "react";
import { clearSession, readSession, saveSession } from "../lib/session.js";

export default function useSession() {
  const [session, setSession] = useState(readSession);

  function authenticate(nextSession) {
    saveSession(nextSession);
    setSession(nextSession);
  }

  function logout() {
    clearSession();
    setSession(null);
  }

  return { session, authenticate, logout };
}
