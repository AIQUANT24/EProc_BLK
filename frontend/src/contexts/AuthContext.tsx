import React, { createContext, useContext, useState, useCallback } from "react";

export type UserRole = "superadmin" | "admin" | "procurement" | "supplier" | "auditor";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginAsDemo: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const DEMO_USERS: Record<UserRole, User> = {
  superadmin: { id: "sa-001", name: "Dr. Meera Iyer", email: "superadmin@nmicov.gov.in", role: "superadmin", organization: "DPIIT — Ministry of Commerce" },
  admin: { id: "admin-001", name: "Rajesh Kumar", email: "admin@nmicov.gov.in", role: "admin", organization: "DPIIT" },
  procurement: { id: "proc-001", name: "Anita Sharma", email: "procurement@nmicov.gov.in", role: "procurement", organization: "GeM" },
  supplier: { id: "sup-001", name: "Vikram Industries", email: "supplier@vikram.co.in", role: "supplier", organization: "Vikram Industries Pvt Ltd" },
  auditor: { id: "aud-001", name: "CAG Audit Division", email: "auditor@cag.gov.in", role: "auditor", organization: "Comptroller & Auditor General" },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("nmicov_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (email: string, _password: string) => {
    const found = Object.values(DEMO_USERS).find(u => u.email === email);
    if (found) {
      setUser(found);
      localStorage.setItem("nmicov_user", JSON.stringify(found));
      return true;
    }
    return false;
  }, []);

  const loginAsDemo = useCallback((role: UserRole) => {
    const u = DEMO_USERS[role];
    setUser(u);
    localStorage.setItem("nmicov_user", JSON.stringify(u));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("nmicov_user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loginAsDemo, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
