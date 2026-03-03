import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/adminApi";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X } from "lucide-react";

const CATEGORIES = ["Whiskey", "Wine", "Vodka", "Beer", "Tequila", "Rum", "Gin", "Other"];

const emptyForm = { name: "", brand: "", category: "Whiskey", alcohol_percentage: "", volume_ml: "", sku: "", price: "", description: "", tasting_notes: "", image_url: "", is_active: true };

export default function ProductsPage() {
    const qc = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState<any>(emptyForm);

    const { data: products = [], isLoading } = useQuery({
        queryKey: ["admin-products"],
        queryFn: () => api.get("/admin/products").then((r) => r.data),
    });

    const saveMutation = useMutation({
        mutationFn: (data: any) =>
            editing ? api.put(`/admin/products/${editing.id}`, data) : api.post("/admin/products", data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); closeModal(); },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/admin/products/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, is_active }: any) => api.put(`/admin/products/${id}`, { is_active }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
    });

    const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
    const openEdit = (p: any) => { setEditing(p); setForm({ ...p, alcohol_percentage: p.alcohol_percentage || "", volume_ml: p.volume_ml || "" }); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setEditing(null); };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveMutation.mutate({ ...form, price: parseFloat(form.price), alcohol_percentage: parseFloat(form.alcohol_percentage) || null, volume_ml: parseInt(form.volume_ml) || null });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-white">Products</h1>
                    <p className="text-gray-500 text-sm mt-1">{products.length} products in catalog</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 bg-[#8b1a1a] hover:bg-[#c0392b] text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors">
                    <Plus size={16} /> Add Product
                </button>
            </div>

            {isLoading ? (
                <div className="text-gray-500 text-center py-20">Loading...</div>
            ) : (
                <div className="bg-[#111] border border-white/5 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-xs uppercase tracking-widest text-gray-600 border-b border-white/5 bg-[#0d0d0d]">
                                {["Product", "Brand", "Category", "Price", "Status", "Actions"].map((h) => (
                                    <th key={h} className="px-5 py-4 text-left">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {products.map((p: any) => (
                                <tr key={p.id} className="hover:bg-white/2 transition-colors group">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            {p.image_url && <img src={p.image_url} alt={p.name} className="w-10 h-10 object-cover rounded" />}
                                            <span className="font-medium text-white">{p.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-gray-400">{p.brand}</td>
                                    <td className="px-5 py-4"><span className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300">{p.category}</span></td>
                                    <td className="px-5 py-4 text-green-400 font-medium">${parseFloat(p.price).toFixed(2)}</td>
                                    <td className="px-5 py-4">
                                        <button onClick={() => toggleMutation.mutate({ id: p.id, is_active: !p.is_active })}>
                                            {p.is_active
                                                ? <ToggleRight size={22} className="text-green-400" />
                                                : <ToggleLeft size={22} className="text-gray-600" />}
                                        </button>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"><Pencil size={14} /></button>
                                            <button onClick={() => { if (confirm("Deactivate this product?")) deleteMutation.mutate(p.id); }} className="p-1.5 hover:bg-red-500/10 rounded text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#111] border border-white/10 rounded-xl w-full max-w-xl max-h-[90vh] overflow-auto">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="font-serif font-bold text-white text-lg">{editing ? "Edit Product" : "Add Product"}</h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {[
                                { label: "Product Name", key: "name", required: true },
                                { label: "Brand", key: "brand", required: true },
                                { label: "Price ($)", key: "price", type: "number", required: true },
                                { label: "SKU", key: "sku" },
                                { label: "ABV (%)", key: "alcohol_percentage", type: "number" },
                                { label: "Volume (ml)", key: "volume_ml", type: "number" },
                                { label: "Image URL", key: "image_url" },
                            ].map(({ label, key, type = "text", required }) => (
                                <div key={key}>
                                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1.5">{label}</label>
                                    <input
                                        type={type}
                                        value={form[key]}
                                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                        required={required}
                                        step={type === "number" ? "0.01" : undefined}
                                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-md px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b1a1a]"
                                    />
                                </div>
                            ))}
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1.5">Category</label>
                                <select
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-md px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b1a1a]"
                                >
                                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1.5">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={3}
                                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-md px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b1a1a] resize-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeModal} className="flex-1 border border-white/10 text-gray-400 py-2.5 rounded-md text-sm hover:bg-white/5 transition-colors">Cancel</button>
                                <button type="submit" disabled={saveMutation.isPending} className="flex-1 bg-[#8b1a1a] hover:bg-[#c0392b] text-white py-2.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50">
                                    {saveMutation.isPending ? "Saving..." : editing ? "Save Changes" : "Create Product"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
