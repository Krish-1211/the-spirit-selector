import { NavLink, useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { LayoutDashboard, Package, Warehouse, ShoppingBag, Users, LogOut, Boxes, ArrowLeft, Settings, FileText } from "lucide-react";

const navItems = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/products", icon: Package, label: "Products" },
    { to: "/admin/inventory", icon: Warehouse, label: "Inventory" },
    { to: "/admin/orders", icon: ShoppingBag, label: "Orders" },
    { to: "/admin/invoices", icon: FileText, label: "Invoices" },
    { to: "/admin/clients", icon: Users, label: "Clients" },
    { to: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAdminAuth();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate("/admin/login"); };

    return (
        <div className="flex h-screen bg-[#0a0a0a] overflow-hidden fixed inset-0 z-50">
            {/* Sidebar */}
            <aside className="w-60 flex-shrink-0 bg-[#111] border-r border-white/5 flex flex-col">
                <div className="px-6 py-5 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <Boxes size={18} className="text-[#8b1a1a]" />
                        <span className="font-serif font-bold text-white text-base tracking-wide uppercase">RESERVE</span>
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-600 mt-0.5">Inventory Management</p>
                </div>
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === "/admin"}
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
                <div className="px-4 py-4 border-t border-white/5 space-y-1">
                    <button
                        onClick={() => navigate("/")}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
                    >
                        <ArrowLeft size={14} /> Back to Store
                    </button>
                    <div className="flex items-center gap-3 px-1 py-2">
                        <div className="w-7 h-7 rounded-full bg-[#8b1a1a]/30 flex items-center justify-center text-xs font-bold text-[#c0392b] uppercase">
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
            <main className="flex-1 overflow-auto bg-[#0a0a0a]">
                <div className="p-8">{children}</div>
            </main>
        </div>
    );
}
