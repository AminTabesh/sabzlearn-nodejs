import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import { api, ApiError } from "../lib/api";
import { clearSession, readSession, saveSession } from "../lib/session";
export const SessionContext = createContext(null);
export const useAccount = () => useContext(SessionContext);
export default function useSession() {
  const [session, setSession] = useState(readSession);
  const current = useRef(session);
  const [status, setStatus] = useState(session ? "loading" : "ready");
  const revision = useRef(0);
  const logout = useCallback(() => {
    revision.current++;
    current.current = null;
    clearSession();
    setSession(null);
    setStatus("ready");
  }, []);
  const authenticate = useCallback((next) => {
    revision.current++;
    current.current = next;
    saveSession(next);
    setSession(next);
    setStatus("ready");
  }, []);
  const updateUser = useCallback((user) => {
    if (current.current) {
      const next = { ...current.current, user };
      current.current = next;
      saveSession(next);
      setSession(next);
    }
  }, []);
  const refresh = useCallback(async () => {
    if (!current.current) return null;
    const version = revision.current;
    try {
      const { user } = await api("/auth/me", {
        token: current.current.accessToken,
      });
      if (version !== revision.current) return null;
      if (!user?._id || !["USER", "ADMIN"].includes(user.role))
        throw new ApiError("اطلاعات حساب کامل دریافت نشد. دوباره تلاش کن.", 0);
      updateUser(user);
      setStatus("ready");
      return user;
    } catch (e) {
      if (version !== revision.current) return null;
      if (e.status === 401) logout();
      else setStatus("error");
      toast.error(e.message);
      throw e;
    }
  }, [logout, updateUser]);
  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);
  const request = useCallback(
    async (path, options = {}) => {
      try {
        return await api(path, {
          ...options,
          token: current.current?.accessToken,
        });
      } catch (e) {
        if (
          e.status === 401 &&
          !(
            options.operation === "password" &&
            e.data?.message === "Current password is incorrect."
          )
        )
          logout();
        if (e.status === 403) await refresh().catch(() => {});
        throw e;
      }
    },
    [logout, refresh],
  );
  return {
    session,
    status,
    authenticate,
    logout,
    updateUser,
    refresh,
    request,
  };
}
