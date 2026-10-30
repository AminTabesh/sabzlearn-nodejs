const storageKey = "rasta-session";

export function readSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem(storageKey));
    if (!session?.user || !session?.accessToken) return null;

    const encodedPayload = session.accessToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(encodedPayload));
    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    clearSession();
    return null;
  }
}

export function saveSession(session) {
  sessionStorage.setItem(storageKey, JSON.stringify(session));
}

export function clearSession() {
  sessionStorage.removeItem(storageKey);
}
