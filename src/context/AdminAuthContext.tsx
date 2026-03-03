import React, { createContext, useContext, useState, useEffect } from "react";
import adminApi from "@/lib/adminApi";

interface Admin {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
}

interface AdminAuthCtx {
    user: Admin | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthCtx | null>(null);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<Admin | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("admin_token");
        const stored = localStorage.getItem("admin_user");
        if (token && stored) {
            try { setUser(JSON.parse(stored)); } catch { }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const res = await adminApi.post("/auth/admin/login", { email, password });
        localStorage.setItem("admin_token", res.data.token);
        localStorage.setItem("admin_user", JSON.stringify(res.data.user));
        setUser(res.data.user);
    };

    const logout = () => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        setUser(null);
    };

    return (
        <AdminAuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => {
    const ctx = useContext(AdminAuthContext);
    if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
    return ctx;
};
