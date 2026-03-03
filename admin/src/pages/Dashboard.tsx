import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import { DollarSign, ShoppingBag, AlertTriangle, TrendingUp } from "lucide-react";

const statusColor: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400",
    confirmed: "bg-blue-500/10 text-blue-400",
    ready: "bg-purple-500/10 text-purple-400",
    delivered: "bg-green-500/10 text-green-400",
    cancelled: "bg-red-500/10 text-red-400",
};

export default function Dashboard() {
    const [storeId, setStoreId] = useState("");

    const { data: stores = [] } = useQuery({
        queryKey: ["stores"],
        queryFn: () => api.get("/admin/stores").then((r) => r.data),
    });

    const { data: stats, isLoading } = useQuery({
        queryKey: ["dashboard", storeId],
        queryFn: () => api.get(`/admin/dashboard${storeId ? `?store_id=${storeId}` : ""}`).then((r) => r.data),
    });

    const { data: lowStock = [] } = useQuery({
        queryKey: ["lowstock", storeId],
        queryFn: () => api.get(`/admin/inventory/low-stock${storeId ? `?store_id=${storeId}` : ""}`).then((r) => r.data),
    });

    const totalOrders = stats?.orders_by_status?.reduce((a: number, b: any) => a + parseInt(b.total_orders), 0) ?? 0;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-white">Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Real-time store overview</p>
                </div>
                <select
                    value={storeId}
                    onChange={(e) => setStoreId(e.target.value)}
                    className="bg-[#1a1a1a] border border-white/10 text-gray-300 text-sm rounded-md px-4 py-2 focus:outline-none focus:border-[#8b1a1a]"
                >
                    <option value="">All Stores</option>
                    {stores.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-5 mb-8">
                {[
                    { label: "Total Revenue", value: `$${(stats?.total_revenue ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "text-green-400" },
                    { label: "Total Orders", value: totalOrders, icon: ShoppingBag, color: "text-blue-400" },
                    { label: "Low Stock Alerts", value: stats?.low_stock_count ?? 0, icon: AlertTriangle, color: "text-yellow-400" },
                    { label: "Active Stores", value: stores.filter((s: any) => s.is_active).length, icon: TrendingUp, color: "text-purple-400" },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-[#111] border border-white/5 rounded-lg p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs uppercase tracking-widest text-gray-500">{label}</p>
                            <Icon size={18} className={color} />
                        </div>
                        <p className={`text-3xl font-bold ${color}`}>{isLoading ? "—" : value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Orders by Status */}
                <div className="bg-[#111] border border-white/5 rounded-lg p-6">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">Orders by Status</h2>
                    {stats?.orders_by_status?.length ? (
                        <div className="space-y-3">
                            {stats.orders_by_status.map((row: any) => (
                                <div key={row.status} className="flex items-center justify-between">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColor[row.status] || "bg-gray-500/10 text-gray-400"}`}>
                                        {row.status}
                                    </span>
                                    <span className="text-white font-bold">{row.total_orders}</span>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-gray-600 text-sm">No orders yet</p>}
                </div>

                {/* Low Stock */}
                <div className="bg-[#111] border border-white/5 rounded-lg p-6">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-yellow-500/70 mb-4 flex items-center gap-2">
                        <AlertTriangle size={14} /> Low Stock Alerts
                    </h2>
                    {lowStock.length ? (
                        <div className="space-y-3 max-h-72 overflow-auto">
                            {lowStock.map((item: any) => (
                                <div key={item.id} className="flex items-center justify-between text-sm border-b border-white/5 pb-2">
                                    <div>
                                        <p className="text-white font-medium">{item.product_name}</p>
                                        <p className="text-gray-500 text-xs">{item.store_name}</p>
                                    </div>
                                    <span className="text-yellow-400 font-bold">{item.available_quantity} left</span>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-gray-600 text-sm">✓ All stock levels are healthy</p>}
                </div>
            </div>

            {/* Recent Orders */}
            <div className="mt-6 bg-[#111] border border-white/5 rounded-lg p-6">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">Recent Orders</h2>
                {stats?.recent_orders?.length ? (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-xs uppercase tracking-widest text-gray-600 border-b border-white/5">
                                <th className="pb-3 text-left">Order #</th>
                                <th className="pb-3 text-left">Store</th>
                                <th className="pb-3 text-left">Total</th>
                                <th className="pb-3 text-left">Status</th>
                                <th className="pb-3 text-left">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {stats.recent_orders.map((o: any) => (
                                <tr key={o.id} className="text-gray-300">
                                    <td className="py-3 font-mono text-white">#{o.order_number}</td>
                                    <td className="py-3 text-gray-400 text-xs truncate max-w-[150px]">{o.store_name}</td>
                                    <td className="py-3 text-green-400">${parseFloat(o.total).toFixed(2)}</td>
                                    <td className="py-3"><span className={`px-2 py-0.5 rounded text-xs capitalize ${statusColor[o.status]}`}>{o.status}</span></td>
                                    <td className="py-3 text-gray-500 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <p className="text-gray-600 text-sm">No recent orders</p>}
            </div>
        </div>
    );
}
