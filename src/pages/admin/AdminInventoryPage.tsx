import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/adminApi";
import { AlertTriangle, Pencil, X } from "lucide-react";

export default function InventoryPage() {
    const qc = useQueryClient();
    const [storeId, setStoreId] = useState("");
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState({ stock_quantity: 0, low_stock_threshold: 5 });

    const { data: stores = [] } = useQuery({ queryKey: ["stores"], queryFn: () => api.get("/admin/stores").then((r) => r.data) });
    const { data: inventory = [], isLoading } = useQuery({
        queryKey: ["inventory", storeId],
        queryFn: () => api.get(`/admin/inventory${storeId ? `?store_id=${storeId}` : ""}`).then((r) => r.data),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: any) => api.put(`/admin/inventory/${id}`, data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["inventory"] }); setEditing(null); },
    });

    const openEdit = (item: any) => {
        setEditing(item);
        setForm({ stock_quantity: item.stock_quantity, low_stock_threshold: item.low_stock_threshold });
    };

    const getStatusBadge = (item: any) => {
        const avail = item.stock_quantity - (item.reserved_quantity || 0);
        if (avail <= 0) return <span className="px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-400">Out of Stock</span>;
        if (avail <= item.low_stock_threshold) return <span className="px-2 py-0.5 rounded text-xs bg-yellow-500/10 text-yellow-400 flex items-center gap-1"><AlertTriangle size={10} />Low Stock</span>;
        return <span className="px-2 py-0.5 rounded text-xs bg-green-500/10 text-green-400">In Stock</span>;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">Inventory</h1>
                    <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Manage stock levels per store</p>
                </div>
                <select
                    value={storeId}
                    onChange={(e) => setStoreId(e.target.value)}
                    className="w-full sm:w-auto bg-[#1a1a1a] border border-white/10 text-gray-300 text-xs sm:text-sm rounded-md px-4 py-2 focus:outline-none focus:border-[#8b1a1a]"
                >
                    <option value="">All Stores</option>
                    {stores.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>

            {isLoading ? (
                <div className="text-gray-500 text-center py-20">Loading...</div>
            ) : (
                <div className="bg-[#111] border border-white/5 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[700px]">
                            <thead>
                                <tr className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-600 border-b border-white/5 bg-[#0d0d0d]">
                                    <th className="px-4 sm:px-5 py-4 text-left">Product</th>
                                    <th className="px-4 sm:px-5 py-4 text-left">Store</th>
                                    <th className="px-4 sm:px-5 py-4 text-left">Stock</th>
                                    <th className="px-4 sm:px-5 py-4 text-left">Reserved</th>
                                    <th className="px-4 sm:px-5 py-4 text-left">Available</th>
                                    <th className="px-4 sm:px-5 py-4 text-left">Threshold</th>
                                    <th className="px-4 sm:px-5 py-4 text-left">Status</th>
                                    <th className="px-4 sm:px-5 py-4 text-left"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {inventory.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-white/2 transition-colors group">
                                        <td className="px-4 sm:px-5 py-4">
                                            <p className="font-medium text-white line-clamp-1">{item.product_name}</p>
                                            <p className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[120px]">{item.brand} · {item.category}</p>
                                        </td>
                                        <td className="px-4 sm:px-5 py-4 text-gray-400 text-[10px] sm:text-xs truncate max-w-[120px]">{item.store_name}</td>
                                        <td className="px-4 sm:px-5 py-4 text-white font-bold">{item.stock_quantity}</td>
                                        <td className="px-4 sm:px-5 py-4 text-yellow-400 lg:text-center text-left">{item.reserved_quantity || 0}</td>
                                        <td className="px-4 sm:px-5 py-4 text-green-400 font-bold">{item.available_quantity}</td>
                                        <td className="px-4 sm:px-5 py-4 text-gray-500 lg:text-center text-left">{item.low_stock_threshold}</td>
                                        <td className="px-4 sm:px-5 py-4">{getStatusBadge(item)}</td>
                                        <td className="px-4 sm:px-5 py-4 text-right">
                                            <button onClick={() => openEdit(item)} className="lg:opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-all inline-flex items-center justify-center">
                                                <Pencil size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {inventory.length === 0 && <p className="text-gray-600 text-[10px] sm:text-sm text-center py-12">No inventory records found</p>}
                </div>
            )}

            {/* Edit Modal */}
            {editing && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-[#111] border border-white/10 rounded-xl w-full max-w-sm p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-serif font-bold text-white">Adjust Stock</h2>
                            <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-white"><X size={18} /></button>
                        </div>
                        <p className="text-gray-400 text-sm mb-5">{editing.product_name} @ {editing.store_name}</p>
                        <div className="space-y-4">
                            {[
                                { label: "Stock Quantity", key: "stock_quantity" },
                                { label: "Low Stock Threshold", key: "low_stock_threshold" },
                            ].map(({ label, key }) => (
                                <div key={key}>
                                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1.5">{label}</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={(form as any)[key]}
                                        onChange={(e) => setForm({ ...form, [key]: parseInt(e.target.value) })}
                                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-md px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b1a1a]"
                                    />
                                </div>
                            ))}
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setEditing(null)} className="flex-1 border border-white/10 text-gray-400 py-2.5 rounded-md text-sm hover:bg-white/5">Cancel</button>
                                <button
                                    onClick={() => updateMutation.mutate({ id: editing.id, data: form })}
                                    disabled={updateMutation.isPending}
                                    className="flex-1 bg-[#8b1a1a] hover:bg-[#c0392b] text-white py-2.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    {updateMutation.isPending ? "Saving..." : "Update Stock"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
