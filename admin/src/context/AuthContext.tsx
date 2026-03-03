import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";

interface Admin { id: string; email: string; first_name: string; last_name: string; role: string; }
interface AuthCtx { user: Admin | null; login: (email: string, password: string) => Promise<void>; logout: () => void; isLoading: boolean; }

const AuthContext = createContext<AuthCtx | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<Admin | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("admin_token");
        const storedUser = localStorage.getItem("admin_user");
        if (token && storedUser) {
            try { setUser(JSON.parse(storedUser)); } catch { }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const res = await api.post("/auth/admin/login", { email, password });
        localStorage.setItem("admin_token", res.data.token);
        localStorage.setItem("admin_user", JSON.stringify(res.data.user));
        setUser(res.data.user);
    };

    const logout = () => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        setUser(null);
    };

    return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
