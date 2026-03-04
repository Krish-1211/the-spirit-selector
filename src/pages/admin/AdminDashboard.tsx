import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import adminApi from "@/lib/adminApi";
import { DollarSign, ShoppingBag, AlertTriangle, TrendingUp } from "lucide-react";

const statusColor: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400",
    confirmed: "bg-blue-500/10 text-blue-400",
    ready: "bg-purple-500/10 text-purple-400",
    delivered: "bg-green-500/10 text-green-400",
    cancelled: "bg-red-500/10 text-red-400",
};

export default function AdminDashboard() {
    const [storeId, setStoreId] = useState("");

    const { data: stores = [] } = useQuery({ queryKey: ["a-stores"], queryFn: () => adminApi.get("/admin/stores").then((r) => r.data) });
    const { data: stats, isLoading } = useQuery({ queryKey: ["a-dashboard", storeId], queryFn: () => adminApi.get(`/admin/dashboard${storeId ? `?store_id=${storeId}` : ""}`).then((r) => r.data) });
    const { data: lowStock = [] } = useQuery({ queryKey: ["a-lowstock", storeId], queryFn: () => adminApi.get(`/admin/inventory/low-stock${storeId ? `?store_id=${storeId}` : ""}`).then((r) => r.data) });

    const totalOrders = stats?.orders_by_status?.reduce((a: number, b: any) => a + parseInt(b.total_orders), 0) ?? 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">Dashboard</h1>
                    <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Real-time store overview</p>
                </div>
                <select
                    value={storeId}
                    onChange={(e) => setStoreId(e.target.value)}
                    className="w-full sm:w-auto bg-[#1a1a1a] border border-white/10 text-gray-300 text-sm rounded-md px-4 py-2 focus:outline-none focus:border-[#8b1a1a]"
                >
                    <option value="">All Stores</option>
                    {stores.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {[
                    { label: "Total Revenue", value: `$${(stats?.total_revenue ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "text-green-400" },
                    { label: "Total Orders", value: totalOrders, icon: ShoppingBag, color: "text-blue-400" },
                    { label: "Low Stock Alerts", value: stats?.low_stock_count ?? 0, icon: AlertTriangle, color: "text-yellow-400" },
                    { label: "Active Clients", value: stats?.total_clients ?? 0, icon: TrendingUp, color: "text-purple-400" },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-[#111] border border-white/5 rounded-lg p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-500">{label}</p>
                            <Icon size={16} className={color} />
                        </div>
                        <p className={`text-xl sm:text-2xl lg:text-3xl font-bold truncate ${color}`}>
                            {isLoading ? "—" : value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#111] border border-white/5 rounded-lg p-4 sm:p-6 text-sm flex flex-col">
                    <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4 text-left">Orders by Status</h2>
                    {stats?.orders_by_status?.length ? (
                        <div className="space-y-3 flex-1">
                            {stats.orders_by_status.map((row: any) => (
                                <div key={row.status} className="flex items-center justify-between">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium capitalize ${statusColor[row.status] || "bg-gray-500/10 text-gray-400"}`}>{row.status}</span>
                                    <span className="text-white font-bold">{row.total_orders}</span>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-gray-600 text-sm">No orders yet</p>}
                </div>

                <div className="bg-[#111] border border-white/5 rounded-lg p-4 sm:p-6 text-sm flex flex-col">
                    <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-yellow-500/70 mb-4 flex items-center gap-2 text-left">
                        <AlertTriangle size={14} /> Low Stock Alerts
                    </h2>
                    {lowStock.length ? (
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 flex-1 scrollbar-hide">
                            {lowStock.map((item: any) => (
                                <div key={item.id} className="flex items-center justify-between text-xs sm:text-sm border-b border-white/5 pb-2">
                                    <div className="pr-4 min-w-0">
                                        <p className="text-white font-medium truncate">{item.product_name}</p>
                                        <p className="text-gray-500 text-[10px] sm:text-xs truncate">{item.store_name}</p>
                                    </div>
                                    <span className="text-yellow-400 font-bold whitespace-nowrap flex-shrink-0">{item.available_quantity} left</span>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-gray-600 text-sm">✓ All stock levels healthy</p>}
                </div>
            </div>

            <div className="bg-[#111] border border-white/5 rounded-lg p-4 sm:p-6 overflow-hidden flex flex-col">
                <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4 text-left">Recent Orders</h2>
                {stats?.recent_orders?.length ? (
                    <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
                        <table className="w-full text-sm min-w-[600px]">
                            <thead>
                                <tr className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-600 border-b border-white/5">
                                    <th className="pb-3 pr-4 text-left whitespace-nowrap">Order #</th>
                                    <th className="pb-3 px-4 text-left whitespace-nowrap">Store</th>
                                    <th className="pb-3 px-4 text-left whitespace-nowrap">Total</th>
                                    <th className="pb-3 px-4 text-left whitespace-nowrap">Status</th>
                                    <th className="pb-3 pl-4 text-right whitespace-nowrap">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {stats.recent_orders.map((o: any) => (
                                    <tr key={o.id} className="text-gray-300">
                                        <td className="py-3 pr-4 font-mono text-white text-xs sm:text-sm whitespace-nowrap">#{o.order_number}</td>
                                        <td className="py-3 px-4 text-gray-400 text-[10px] sm:text-xs max-w-[150px] truncate">{o.store_name}</td>
                                        <td className="py-3 px-4 text-green-400 text-xs sm:text-sm font-medium whitespace-nowrap">${parseFloat(o.total).toFixed(2)}</td>
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded text-[10px] sm:text-xs capitalize inline-block ${statusColor[o.status]}`}>
                                                {o.status}
                                            </span>
                                        </td>
                                        <td className="py-3 pl-4 text-gray-500 text-[10px] sm:text-xs whitespace-nowrap text-right">{new Date(o.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className="text-gray-600 text-sm">No recent orders</p>}
            </div>
        </div>
    );
}

