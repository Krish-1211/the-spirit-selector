import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, Package, Warehouse, ShoppingBag, LogOut, Wine } from "lucide-react";

const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/products", icon: Package, label: "Products" },
    { to: "/inventory", icon: Warehouse, label: "Inventory" },
    { to: "/orders", icon: ShoppingBag, label: "Orders" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => { logout(); navigate("/login"); };

    return (
        <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
            {/* Sidebar */}
            <aside className="w-60 flex-shrink-0 bg-[#111] border-r border-white/5 flex flex-col">
                <div className="px-6 py-6 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <Wine size={20} className="text-[#8b1a1a]" />
                        <span className="font-serif font-bold text-white text-lg tracking-wide">RESERVE</span>
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-600 mt-0.5">Admin Console</p>
                </div>
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === "/"}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${isActive
                                    ? "bg-[#8b1a1a]/20 text-[#c0392b] font-medium"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`
                            }
                        >
                            <Icon size={16} />
                            {label}
                        </NavLink>
                    ))}
                </nav>
                <div className="px-4 py-4 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-3 px-1">
                        <div className="w-8 h-8 rounded-full bg-[#8b1a1a]/30 flex items-center justify-center text-xs font-bold text-[#c0392b] uppercase">
                            {user?.first_name?.[0]}{user?.last_name?.[0]}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-medium text-white truncate">{user?.first_name} {user?.last_name}</p>
                            <p className="text-[10px] text-gray-500 capitalize">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                        <LogOut size={14} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">{children}</div>
            </main>
        </div>
    );
}
