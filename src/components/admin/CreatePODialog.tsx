import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/adminApi";
import { X, Plus, Trash2, Import, Search } from "lucide-react";
import ImportPODialog from "./ImportPODialog";
import { toast } from "sonner";

export default function CreatePODialog({ onClose }: { onClose: () => void }) {
    const qc = useQueryClient();
    const [vendorId, setVendorId] = useState("");
    const [storeId, setStoreId] = useState("");
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState<any[]>([]);
    const [showImport, setShowImport] = useState(false);
    const [search, setSearch] = useState("");

    const { data: stores = [] } = useQuery({ queryKey: ["stores"], queryFn: () => api.get("/admin/stores").then((r) => r.data) });
    const { data: vendors = [] } = useQuery({ queryKey: ["vendors"], queryFn: () => api.get("/admin/vendors").then((r) => r.data) });
    const { data: products = [] } = useQuery({ queryKey: ["admin-products"], queryFn: () => api.get("/admin/products").then((r) => r.data) });

    const createPO = useMutation({
        mutationFn: (data: any) => api.post("/admin/purchase-orders", data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["purchase-orders"] });
            toast.success("Purchase Order created successfully");
            onClose();
        },
        onError: () => toast.error("Failed to create Purchase Order"),
    });

    const addItem = (product: any) => {
        if (items.find(i => i.product_id === product.id)) return;
        setItems([...items, { product_id: product.id, product_name: product.name, sku: product.sku, quantity: 1, unit_cost: product.price || 0 }]);
    };

    const removeItem = (id: string) => setItems(items.filter(i => i.product_id !== id));

    const updateItem = (id: string, field: string, value: any) => {
        setItems(items.map(i => i.product_id === id ? { ...i, [field]: value } : i));
    };

    const handleImportData = (importedItems: any[]) => {
        const newItems = [...items];
        importedItems.forEach(item => {
            const existing = newItems.findIndex(ni => ni.product_id === item.product_id);
            if (existing > -1) {
                newItems[existing].quantity += item.quantity;
            } else {
                newItems.push(item);
            }
        });
        setItems(newItems);
        setShowImport(false);
    };

    const total = items.reduce((sum, i) => sum + (i.quantity * i.unit_cost), 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!vendorId || !storeId || items.length === 0) {
            toast.error("Please select vendor, store and add at least one item");
            return;
        }
        createPO.mutate({ vendor_id: vendorId, store_id: storeId, notes, items });
    };

    const filteredProducts = products.filter((p: any) => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.sku.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 5);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#111] border border-white/10 rounded-xl w-full max-w-4xl flex flex-col max-h-[95vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="font-serif font-bold text-white text-xl">Create Purchase Order</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs uppercase tracking-widest text-gray-500 font-medium">Vendor</label>
                                <select 
                                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-md px-4 py-2 text-white text-sm focus:outline-none focus:border-[#8b1a1a]"
                                    value={vendorId}
                                    onChange={(e) => setVendorId(e.target.value)}
                                    required
                                >
                                    <option value="">Select Vendor</option>
                                    {vendors.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs uppercase tracking-widest text-gray-500 font-medium">Store Location</label>
                                <select 
                                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-md px-4 py-2 text-white text-sm focus:outline-none focus:border-[#8b1a1a]"
                                    value={storeId}
                                    onChange={(e) => setStoreId(e.target.value)}
                                    required
                                >
                                    <option value="">Select Store</option>
                                    {stores.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Line Items</h3>
                                <button 
                                    type="button"
                                    onClick={() => setShowImport(true)}
                                    className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300"
                                >
                                    <Import size={14} /> Import from Excel
                                </button>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Search products to add..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-md pl-10 pr-4 py-2 text-white text-sm focus:border-white/20"
                                />
                                {search && (
                                    <div className="absolute top-full left-0 right-0 bg-[#1a1a1a] border border-white/10 rounded-md mt-1 z-10 shadow-xl">
                                        {filteredProducts.map((p: any) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => { addItem(p); setSearch(""); }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 flex justify-between items-center"
                                            >
                                                <span>{p.name} <span className="text-gray-500 text-[10px] ml-2">SKU: {p.sku}</span></span>
                                                <Plus size={14} />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                {items.length === 0 ? (
                                    <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-lg">
                                        <p className="text-xs text-gray-500 italic">No items added to this PO</p>
                                    </div>
                                ) : (
                                    <div className="border border-white/5 rounded-lg overflow-hidden">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-white/5 text-gray-400 uppercase tracking-tighter">
                                                <tr>
                                                    <th className="px-4 py-3">Product</th>
                                                    <th className="px-4 py-3 w-20 text-center">Qty</th>
                                                    <th className="px-4 py-3 w-32">Unit Cost</th>
                                                    <th className="px-4 py-3 w-24">Line Total</th>
                                                    <th className="px-4 py-3 w-10"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5 bg-[#0d0d0d]">
                                                {items.map((item) => (
                                                    <tr key={item.product_id} className="text-gray-300">
                                                        <td className="px-4 py-3">
                                                            <p className="font-medium text-white">{item.product_name}</p>
                                                            <p className="text-[10px] text-gray-500 font-mono italic">SKU: {item.sku}</p>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <input 
                                                                type="number" 
                                                                value={item.quantity}
                                                                onChange={(e) => updateItem(item.product_id, "quantity", parseInt(e.target.value) || 0)}
                                                                className="w-full bg-[#1a1a1a] text-center rounded border border-white/10 py-1"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-gray-500">$</span>
                                                                <input 
                                                                    type="number" 
                                                                    step="0.01"
                                                                    value={item.unit_cost}
                                                                    onChange={(e) => updateItem(item.product_id, "unit_cost", parseFloat(e.target.value) || 0)}
                                                                    className="w-full bg-[#1a1a1a] rounded border border-white/10 py-1 px-1"
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 font-mono font-bold text-white">
                                                            ${(item.quantity * item.unit_cost).toFixed(2)}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <button 
                                                                type="button" 
                                                                onClick={() => removeItem(item.product_id)}
                                                                className="text-gray-600 hover:text-red-400"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-72 bg-[#1a1a1a]/50 p-6 border-l border-white/5 flex flex-col justify-between">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-gray-500 font-medium">Notes</label>
                                <textarea 
                                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-md px-3 py-2 text-white text-xs focus:outline-none focus:border-[#8b1a1a] h-32 resize-none"
                                    placeholder="Enter internal notes or comments for vendor..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            <div className="border-t border-white/10 pt-4 space-y-3">
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-gray-400">Total Items</span>
                                    <span className="text-white">{items.reduce((sum, i) => sum + i.quantity, 0)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-400">Grand Total</span>
                                    <span className="text-xl font-bold text-green-400 font-mono">${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-6 lg:pt-0">
                            <button 
                                type="button"
                                onClick={onClose}
                                className="w-full bg-white/5 hover:bg-white/10 text-gray-400 py-3 rounded-md text-sm transition-colors"
                            >
                                Discard
                            </button>
                            <button 
                                type="submit"
                                disabled={createPO.isPending}
                                className="w-full bg-[#8b1a1a] hover:bg-[#c0392b] text-white py-3 rounded-md text-sm font-bold uppercase tracking-widest transition-all glow-button"
                            >
                                {createPO.isPending ? "Submitting..." : "Create PO"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            
            {showImport && (
                <ImportPODialog 
                    onClose={() => setShowImport(false)}
                    onImport={handleImportData}
                />
            )}
        </div>
    );
}
