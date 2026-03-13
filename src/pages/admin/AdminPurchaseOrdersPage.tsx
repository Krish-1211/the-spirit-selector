import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/adminApi";
import { History, Plus, Filter, ArrowRight, CheckCircle2, XCircle, Clock } from "lucide-react";
import CreatePODialog from "@/components/admin/CreatePODialog";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    ordered: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    received: "bg-green-500/10 text-green-400 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function AdminPurchaseOrdersPage() {
    const qc = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedPO, setSelectedPO] = useState<any>(null);
    const [vendorFilter, setVendorFilter] = useState("");
    const [storeFilter, setStoreFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const { data: stores = [] } = useQuery({ queryKey: ["stores"], queryFn: () => api.get("/admin/stores").then((r) => r.data) });
    const { data: vendors = [] } = useQuery({ queryKey: ["vendors"], queryFn: () => api.get("/admin/vendors").then((r) => r.data) });

    const { data: pos = [], isLoading } = useQuery({
        queryKey: ["purchase-orders", vendorFilter, storeFilter, statusFilter],
        queryFn: () => {
            const params = new URLSearchParams();
            if (vendorFilter) params.set("vendor_id", vendorFilter);
            if (storeFilter) params.set("store_id", storeFilter);
            if (statusFilter) params.set("status", statusFilter);
            return api.get(`/admin/purchase-orders?${params}`).then((r) => r.data);
        },
    });

    const { data: poDetail } = useQuery({
        queryKey: ["purchase-order-detail", selectedPO?.id],
        queryFn: () => api.get(`/admin/purchase-orders/${selectedPO.id}`).then((r) => r.data),
        enabled: !!selectedPO,
    });

    const updateStatus = useMutation({
        mutationFn: ({ id, status }: any) => api.put(`/admin/purchase-orders/${id}/status`, { status }),
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ["purchase-orders"] });
            qc.invalidateQueries({ queryKey: ["purchase-order-detail"] });
            qc.invalidateQueries({ queryKey: ["admin-inventory"] }); // Refresh inventory as receipt adds stock
            toast.success(`Purchase Order status updated to ${data.data.status}`);
        },
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-serif font-bold text-white uppercase tracking-wider">Purchase Orders</h1>
                    <p className="text-gray-500 text-[10px] sm:text-sm mt-0.5">Manage stock replenishment and vendor orders</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                        onClick={() => setIsCreateOpen(true)}
                        className="flex items-center justify-center gap-2 bg-[#8b1a1a] hover:bg-[#c0392b] text-white px-5 py-2.5 rounded-md text-sm font-bold transition-all shadow-lg shadow-[#8b1a1a]/10"
                    >
                        <Plus size={18} /> New Purchase Order
                    </button>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        <select 
                            value={vendorFilter} 
                            onChange={(e) => setVendorFilter(e.target.value)}
                            className="bg-[#1a1a1a] border border-white/10 text-gray-300 text-xs rounded-md px-3 py-2 outline-none focus:border-[#8b1a1a]"
                        >
                            <option value="">All Vendors</option>
                            {vendors.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                        <select 
                            value={storeFilter} 
                            onChange={(e) => setStoreFilter(e.target.value)}
                            className="bg-[#1a1a1a] border border-white/10 text-gray-300 text-xs rounded-md px-3 py-2 outline-none focus:border-[#8b1a1a]"
                        >
                            <option value="">All Stores</option>
                            {stores.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-[#1a1a1a] border border-white/10 text-gray-300 text-xs rounded-md px-3 py-2 outline-none focus:border-[#8b1a1a] md:col-span-1 col-span-2"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="ordered">Ordered</option>
                            <option value="received">Received</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className={`bg-[#111] border border-white/5 rounded-xl overflow-hidden transition-all duration-300 ${selectedPO ? "flex-1" : "w-full"}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-white/5 bg-[#0d0d0d]">
                                    <th className="px-6 py-4">PO #</th>
                                    <th className="px-6 py-4">Vendor</th>
                                    <th className="px-6 py-4">Store</th>
                                    <th className="px-6 py-4">Total</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr><td colSpan={6} className="text-center py-20 text-gray-500 italic">Finding records...</td></tr>
                                ) : pos.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-20 text-gray-500 italic">No purchase orders found</td></tr>
                                ) : pos.map((po: any) => (
                                    <tr 
                                        key={po.id} 
                                        onClick={() => setSelectedPO(po)}
                                        className={`cursor-pointer transition-colors ${selectedPO?.id === po.id ? "bg-[#8b1a1a]/10" : "hover:bg-white/[0.02]"}`}
                                    >
                                        <td className="px-6 py-5 font-mono text-white font-bold">#{po.po_number}</td>
                                        <td className="px-6 py-5">
                                            <p className="text-white font-medium">{po.vendor_name}</p>
                                            <p className="text-[10px] text-gray-500">{po.item_count} items</p>
                                        </td>
                                        <td className="px-6 py-5 text-gray-400 text-xs">{po.store_name}</td>
                                        <td className="px-6 py-5 font-mono text-green-400 font-bold">${parseFloat(po.total_amount).toFixed(2)}</td>
                                        <td className="px-6 py-5">
                                            <span className={`px-2.5 py-1 rounded truncate border text-[10px] uppercase tracking-tighter font-bold ${statusColors[po.status]}`}>
                                                {po.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-gray-500 text-xs font-mono">{new Date(po.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {selectedPO && poDetail && (
                    <div className="w-full lg:w-[450px] bg-[#0d0d0d] border border-white/5 rounded-xl flex flex-col max-h-[calc(100vh-200px)] animate-in slide-in-from-right duration-300">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h2 className="font-serif font-bold text-white text-lg">PO #{poDetail.po_number || "—"}</h2>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">{poDetail.vendor_name}</p>
                            </div>
                            <button onClick={() => setSelectedPO(null)} className="text-gray-500 hover:text-white transition-colors text-2xl px-2">×</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Status</p>
                                    <span className={`px-2 py-0.5 rounded border text-[10px] capitalize font-bold inline-block ${statusColors[poDetail.status]}`}>
                                        {poDetail.status}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Ordered For</p>
                                    <p className="text-white text-xs">{poDetail.store_name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Created At</p>
                                    <p className="text-gray-400 text-xs font-mono">{new Date(poDetail.created_at).toLocaleString()}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">PO Amount</p>
                                    <p className="text-green-400 text-sm font-bold font-mono">${parseFloat(poDetail.total_amount).toFixed(2)}</p>
                                </div>
                            </div>

                            {poDetail.notes && (
                                <div className="space-y-1 bg-white/5 p-3 rounded-lg border border-white/5">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Internal Notes</p>
                                    <p className="text-gray-300 text-xs italic">"{poDetail.notes}"</p>
                                </div>
                            )}

                            <div className="space-y-3">
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest px-1">Order Items ({poDetail.items?.length || 0})</p>
                                <div className="space-y-2">
                                    {poDetail.items?.map((item: any) => (
                                        <div key={item.id} className="bg-white/[0.02] border border-white/5 p-3 rounded-lg flex items-center justify-between">
                                            <div className="min-w-0 pr-4">
                                                <p className="text-white text-xs font-semibold truncate">{item.product_name}</p>
                                                <p className="text-[10px] text-gray-500 font-mono italic">SKU: {item.sku}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-white text-xs font-bold font-mono"><span className="text-gray-500 font-normal">Qty:</span> {item.quantity}</p>
                                                <p className="text-green-400 text-[10px] font-mono">${parseFloat(item.unit_cost).toFixed(2)} ea</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 bg-black/20">
                            {poDetail.status === 'pending' || poDetail.status === 'ordered' ? (
                                <div className="space-y-4">
                                    <p className="text-[10px] text-center text-gray-500 uppercase font-bold tracking-widest">Workflow Actions</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {poDetail.status === 'pending' && (
                                            <button 
                                                onClick={() => updateStatus.mutate({ id: poDetail.id, status: 'ordered' })}
                                                className="col-span-2 flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 py-2.5 rounded text-xs font-bold transition-all"
                                            >
                                                <ArrowRight size={14} /> Send to Vendor
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => updateStatus.mutate({ id: poDetail.id, status: 'received' })}
                                            className="flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 py-2.5 rounded text-xs font-bold transition-all"
                                        >
                                            <CheckCircle2 size={14} /> Mark Received
                                        </button>
                                        <button 
                                            onClick={() => updateStatus.mutate({ id: poDetail.id, status: 'cancelled' })}
                                            className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2.5 rounded text-xs font-bold transition-all"
                                        >
                                            <XCircle size={14} /> Cancel PO
                                        </button>
                                    </div>
                                    {poDetail.status === 'ordered' && <p className="text-[10px] text-center text-yellow-500/70 italic">* Inventory will update only when marked 'Received'</p>}
                                </div>
                            ) : poDetail.status === 'received' ? (
                                <div className="flex items-center justify-center gap-2 p-3 bg-green-500/5 border border-green-500/20 rounded-lg text-green-400 text-xs font-bold">
                                    <CheckCircle2 size={16} /> Fully Received & Inventory Updated
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2 p-3 bg-red-500/5 border border-red-500/20 rounded-lg text-red-400 text-xs font-bold">
                                    <XCircle size={16} /> Order Cancelled
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {isCreateOpen && <CreatePODialog onClose={() => setIsCreateOpen(false)} />}
        </div>
    );
}
