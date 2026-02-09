import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { AdminUser, UserRole } from "@/types";

interface AuthContextType {
  isAuthenticated: boolean;
  user: AdminUser | null;
  token: string | null;
  login: (token: string, userData: AdminUser) => void;
  logout: () => void;
  updateUser: (data: Partial<AdminUser>) => void;
  loading: boolean;
  hasPermission: (requiredRole: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser) as AdminUser;
        setIsAuthenticated(true);
        setUser(userData);
        setToken(storedToken);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user" && e.newValue) {
        try {
          const newUser = JSON.parse(e.newValue) as AdminUser;

          const currentUserData = localStorage.getItem("user");
          const currentUser = currentUserData
            ? JSON.parse(currentUserData)
            : null;

          if (currentUser && newUser.id !== currentUser.id) {
            setIsAuthenticated(false);
            setUser(null);
            setToken(null);
            alert(
              `Sesión cerrada: ${newUser.name} se ha logueado en otra pestaña.`
            );
            window.location.href = "/login";
          }
        } catch (error) {
          console.error("Error parsing user data from storage event:", error);
        }
      }

      if (e.key === "token" && !e.newValue) {
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const login = useCallback((token: string, userData: AdminUser) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
    setToken(token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    window.location.href = "/login";
  }, []);

  const updateUser = useCallback((data: Partial<AdminUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...data };
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  }, []);

  const hasPermission = useCallback(
    (requiredRole: UserRole): boolean => {
      if (!user) return false;
      if (user.role === "admin") return true;
      return user.role === requiredRole;
    },
    [user]
  );

  const value = {
    isAuthenticated,
    user,
    token,
    login,
    logout,
    updateUser,
    loading,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
