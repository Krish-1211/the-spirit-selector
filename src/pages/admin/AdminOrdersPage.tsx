import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/adminApi";

const STATUSES = ["pending", "confirmed", "ready", "delivered", "cancelled"];
const statusColor: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    ready: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    delivered: "bg-green-500/10 text-green-400 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function OrdersPage() {
    const qc = useQueryClient();
    const [storeId, setStoreId] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    const { data: stores = [] } = useQuery({ queryKey: ["stores"], queryFn: () => api.get("/admin/stores").then((r) => r.data) });

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ["orders", storeId, statusFilter],
        queryFn: () => {
            const params = new URLSearchParams();
            if (storeId) params.set("store_id", storeId);
            if (statusFilter) params.set("status", statusFilter);
            return api.get(`/admin/orders?${params}`).then((r) => r.data);
        },
    });

    const { data: orderDetail } = useQuery({
        queryKey: ["order-detail", selectedOrder?.id],
        queryFn: () => api.get(`/admin/orders/${selectedOrder.id}`).then((r) => r.data),
        enabled: !!selectedOrder,
    });

    const updateStatus = useMutation({
        mutationFn: ({ id, status }: any) => api.put(`/admin/orders/${id}/status`, { status }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["orders"] });
            qc.invalidateQueries({ queryKey: ["order-detail"] });
        },
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-white">Orders</h1>
                    <p className="text-gray-500 text-sm mt-1">{orders.length} orders</p>
                </div>
                <div className="flex gap-3">
                    <select value={storeId} onChange={(e) => setStoreId(e.target.value)} className="bg-[#1a1a1a] border border-white/10 text-gray-300 text-sm rounded-md px-4 py-2 focus:outline-none focus:border-[#8b1a1a]">
                        <option value="">All Stores</option>
                        {stores.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-[#1a1a1a] border border-white/10 text-gray-300 text-sm rounded-md px-4 py-2 focus:outline-none focus:border-[#8b1a1a]">
                        <option value="">All Status</option>
                        {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex gap-6">
                {/* Orders Table */}
                <div className={`bg-[#111] border border-white/5 rounded-lg overflow-hidden ${selectedOrder ? "flex-1" : "w-full"}`}>
                    {isLoading ? (
                        <div className="text-gray-500 text-center py-20">Loading...</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs uppercase tracking-widest text-gray-600 border-b border-white/5 bg-[#0d0d0d]">
                                    {["Order #", "Customer", "Store", "Total", "Type", "Status", "Date"].map((h) => (
                                        <th key={h} className="px-5 py-4 text-left">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {orders.map((o: any) => (
                                    <tr
                                        key={o.id}
                                        onClick={() => setSelectedOrder(o)}
                                        className={`cursor-pointer transition-colors ${selectedOrder?.id === o.id ? "bg-[#8b1a1a]/10" : "hover:bg-white/2"}`}
                                    >
                                        <td className="px-5 py-4 font-mono text-white font-bold">#{o.order_number}</td>
                                        <td className="px-5 py-4 text-gray-300 text-xs">{o.first_name ? `${o.first_name} ${o.last_name}` : "Guest"}</td>
                                        <td className="px-5 py-4 text-gray-400 text-xs truncate max-w-[120px]">{o.store_name}</td>
                                        <td className="px-5 py-4 text-green-400 font-medium">${parseFloat(o.total).toFixed(2)}</td>
                                        <td className="px-5 py-4 text-gray-400 text-xs capitalize">{o.delivery_type}</td>
                                        <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded border text-xs capitalize ${statusColor[o.status]}`}>{o.status}</span></td>
                                        <td className="px-5 py-4 text-gray-500 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {orders.length === 0 && !isLoading && <p className="text-gray-600 text-center py-12 text-sm">No orders found</p>}
                </div>

                {/* Order Detail Panel */}
                {selectedOrder && orderDetail && (
                    <div className="w-80 flex-shrink-0 bg-[#111] border border-white/5 rounded-lg p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-serif font-bold text-white">Order #{orderDetail.order_number}</h3>
                            <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-white text-lg">×</button>
                        </div>
                        <div className="space-y-3 mb-5">
                            <div className="flex justify-between text-sm"><span className="text-gray-500">Status</span><span className={`px-2 py-0.5 rounded text-xs capitalize border ${statusColor[orderDetail.status]}`}>{orderDetail.status}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-gray-500">Type</span><span className="text-gray-300 capitalize">{orderDetail.delivery_type}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-gray-500">Store</span><span className="text-gray-300 text-xs text-right">{orderDetail.store_name}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-gray-500">Date</span><span className="text-gray-300 text-xs">{new Date(orderDetail.created_at).toLocaleString()}</span></div>
                        </div>

                        <h4 className="text-xs uppercase tracking-widest text-gray-600 mb-3">Items</h4>
                        <div className="space-y-2 mb-5">
                            {orderDetail.items?.map((item: any) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-gray-300">{item.product_name} ×{item.quantity}</span>
                                    <span className="text-gray-400">${parseFloat(item.line_total).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-white/5 pt-3 space-y-1.5 text-sm mb-5">
                            <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>${parseFloat(orderDetail.subtotal).toFixed(2)}</span></div>
                            <div className="flex justify-between text-gray-400"><span>Tax</span><span>${parseFloat(orderDetail.tax).toFixed(2)}</span></div>
                            {parseFloat(orderDetail.delivery_fee) > 0 && <div className="flex justify-between text-gray-400"><span>Delivery</span><span>${parseFloat(orderDetail.delivery_fee).toFixed(2)}</span></div>}
                            <div className="flex justify-between text-white font-bold"><span>Total</span><span>${parseFloat(orderDetail.total).toFixed(2)}</span></div>
                        </div>

                        <h4 className="text-xs uppercase tracking-widest text-gray-600 mb-2">Update Status</h4>
                        <div className="flex flex-wrap gap-2">
                            {STATUSES.filter((s) => s !== orderDetail.status).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => updateStatus.mutate({ id: orderDetail.id, status: s })}
                                    className="px-3 py-1.5 rounded text-xs capitalize border border-white/10 text-gray-400 hover:border-[#8b1a1a] hover:text-white transition-colors"
                                >
                                    → {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
