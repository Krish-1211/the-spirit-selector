import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { LayoutDashboard, Package, Warehouse, ShoppingBag, Users, LogOut, Boxes, ArrowLeft, Settings, FileText, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/products", icon: Package, label: "Products" },
    { to: "/admin/inventory", icon: Warehouse, label: "Inventory" },
    { to: "/admin/orders", icon: ShoppingBag, label: "Orders" },
    { to: "/admin/purchase-orders", icon: FileText, label: "Purchase Orders" },
    { to: "/admin/invoices", icon: FileText, label: "Invoices" },
    { to: "/admin/clients", icon: Users, label: "Clients" },
    { to: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAdminAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => { logout(); navigate("/admin/login"); };

    // Close mobile menu when location changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    return (
        <div className="flex h-[100dvh] w-full bg-[#0a0a0a] overflow-hidden">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#111] border-b border-white/5 flex items-center justify-between px-4 z-40">
                <div className="flex items-center gap-2">
                    <Boxes size={18} className="text-[#8b1a1a]" />
                    <span className="font-serif font-bold text-white text-base tracking-wide uppercase">COMPANY</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                    {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </header>

            {/* Backdrop for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-60 bg-[#111] border-r border-white/5 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                <div className="px-6 py-5 border-b border-white/5 hidden lg:block">
                    <div className="flex items-center gap-2">
                        <Boxes size={18} className="text-[#8b1a1a]" />
                        <span className="font-serif font-bold text-white text-base tracking-wide uppercase">COMPANY</span>
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-600 mt-0.5">Inventory Management</p>
                </div>

                {/* Mobile version of logo area for consistency when open */}
                <div className="px-6 py-5 border-b border-white/5 lg:hidden flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Boxes size={18} className="text-[#8b1a1a]" />
                        <span className="font-serif font-bold text-white text-base tracking-wide uppercase">COMPANY</span>
                    </div>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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
                        <div className="w-7 h-7 rounded-full bg-[#8b1a1a]/30 flex items-center justify-center text-xs font-bold text-[#c0392b] uppercase flex-shrink-0">
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
            <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#0a0a0a] pt-14 lg:pt-0">
                <div className="p-4 sm:p-6 lg:p-8 pb-24 sm:pb-12">{children}</div>
            </main>
        </div>
    );
}

