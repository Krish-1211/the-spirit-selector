import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";

export interface Customer {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    address?: string;
}

interface CustomerAuthCtx {
    customer: Customer | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (data: {
        first_name: string;
        last_name: string;
        email: string;
        password: string;
        phone?: string;
        address?: string;
    }) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const CustomerAuthContext = createContext<CustomerAuthCtx | null>(null);

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem("customer_token");
        const savedUser = localStorage.getItem("customer_user");
        if (savedToken && savedUser) {
            try {
                setToken(savedToken);
                setCustomer(JSON.parse(savedUser));
            } catch { }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const res = await api.post<{ token: string; user: Customer }>("/auth/login", { email, password });
        localStorage.setItem("customer_token", res.token);
        localStorage.setItem("customer_user", JSON.stringify(res.user));
        setToken(res.token);
        setCustomer(res.user);
    };

    const register = async (data: {
        first_name: string;
        last_name: string;
        email: string;
        password: string;
        phone?: string;
        address?: string;
    }) => {
        const res = await api.post<{ token: string; user: Customer }>("/auth/register", data);
        localStorage.setItem("customer_token", res.token);
        localStorage.setItem("customer_user", JSON.stringify(res.user));
        setToken(res.token);
        setCustomer(res.user);
    };

    const logout = () => {
        localStorage.removeItem("customer_token");
        localStorage.removeItem("customer_user");
        setToken(null);
        setCustomer(null);
    };

    return (
        <CustomerAuthContext.Provider value={{ customer, token, login, register, logout, isLoading }}>
            {children}
        </CustomerAuthContext.Provider>
    );
};

export const useCustomerAuth = () => {
    const ctx = useContext(CustomerAuthContext);
    if (!ctx) throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
    return ctx;
};
