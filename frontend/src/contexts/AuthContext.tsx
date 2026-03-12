import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

export type UserRole =
  | "superadmin"
  | "admin"
  | "procurement"
  | "supplier"
  | "auditor";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  organization?: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  resetToken: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  // Added these two methods to the interface
  forgotPassword: (email: string) => Promise<ForgotPasswordResponse>;
  resetPassword: (password: string, token: string) => Promise<boolean>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const API_URL = `${import.meta.env.VITE_API_URL}/auth`;
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Check for existing session on mount
   */
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${API_URL}/profile`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error("Session check failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  /**
   * Standard Login
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login request failed:", error);
      return false;
    }
  }, []);

  /**
   * Request Password Reset Link
   */
  const forgotPassword = useCallback(
    async (email: string): Promise<ForgotPasswordResponse> => {
      try {
        const response = await fetch(`${API_URL}/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
          credentials: "include",
        });

        const data = await response.json();

        return {
          success: response.ok,
          resetToken: data.resetToken as string,
        };
      } catch (error) {
        console.error("Forgot password request failed:", error);
        return { success: false, resetToken: "" };
      }
    },
    [],
  );

  /**
   * Reset Password with Token
   */
  const resetPassword = useCallback(async (password: string, token: string) => {
    try {
      const response = await fetch(`${API_URL}/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include",
      });

      return response.ok;
    } catch (error) {
      console.error("Reset password request failed:", error);
      return false;
    }
  }, []);

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        forgotPassword, // Exposed to components
        resetPassword, // Exposed to components
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
