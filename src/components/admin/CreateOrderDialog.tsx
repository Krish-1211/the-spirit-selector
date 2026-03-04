import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminApi from "@/lib/adminApi";
import { Search, Plus, Trash2, ShoppingCart, User, Store } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function CreateOrderDialog() {
    const qc = useQueryClient();
    const [open, setOpen] = useState(false);
    const [customerId, setCustomerId] = useState("");
    const [storeId, setStoreId] = useState("");
    const [orderItems, setOrderItems] = useState<any[]>([]);
    const [productSearch, setProductSearch] = useState("");

    const { data: stores = [] } = useQuery({ queryKey: ["a-stores"], queryFn: () => adminApi.get("/admin/stores").then((r) => r.data) });
    const { data: clients = [] } = useQuery({ queryKey: ["a-customers"], queryFn: () => adminApi.get("/admin/customers").then((r) => r.data) });
    const { data: products = [] } = useQuery({ queryKey: ["a-products-all"], queryFn: () => adminApi.get("/admin/products").then((r) => r.data) });

    const filteredProducts = products.filter((p: any) =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.brand.toLowerCase().includes(productSearch.toLowerCase())
    );

    const addItem = (product: any) => {
        const existing = orderItems.find(item => item.product_id === product.id);
        if (existing) {
            setOrderItems(orderItems.map(item =>
                item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setOrderItems([...orderItems, {
                product_id: product.id,
                product_name: product.name,
                quantity: 1,
                unit_price: parseFloat(product.price)
            }]);
        }
    };

    const removeItem = (productId: string) => {
        setOrderItems(orderItems.filter(item => item.product_id !== productId));
    };

    const createOrderMutation = useMutation({
        mutationFn: (data: any) => adminApi.post("/orders", data), // Note: using public orders endpoint but with admin context? 
        // Wait, let's check orderController.js. POST /api/orders is the one.
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["orders"] });
            toast.success("Internal order created successfully");
            setOpen(false);
            resetForm();
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || "Failed to create order");
        }
    });

    const resetForm = () => {
        setCustomerId("");
        setStoreId("");
        setOrderItems([]);
        setProductSearch("");
    };

    const calculateSubtotal = () => orderItems.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);

    const handleSubmit = () => {
        if (!storeId) return toast.error("Please select a store");
        if (orderItems.length === 0) return toast.error("Please add at least one item");

        createOrderMutation.mutate({
            store_id: storeId,
            customer_id: customerId || null,
            items: orderItems,
            delivery_type: "pickup", // Default for internal
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="bg-[#8b1a1a] hover:bg-[#a02020] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
                    <Plus size={16} /> Create Order
                </button>
            </DialogTrigger>
            <DialogContent className="bg-[#0f0f0f] border-white/10 text-white max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
                <DialogHeader className="p-6 border-b border-white/5">
                    <DialogTitle className="text-xl font-serif">Create Internal Order</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex divide-x divide-white/5">
                    {/* Left: Product Selection */}
                    <div className="w-1/2 flex flex-col overflow-hidden bg-black/20">
                        <div className="p-4 border-b border-white/5 space-y-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-md pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {filteredProducts.map((p: any) => (
                                <div key={p.id} className="flex items-center justify-between p-2 rounded-md border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-colors">
                                    <div className="overflow-hidden">
                                        <p className="text-xs font-medium text-white truncate">{p.name}</p>
                                        <p className="text-[10px] text-gray-500">{p.brand} • ${parseFloat(p.price).toFixed(2)}</p>
                                    </div>
                                    <button
                                        onClick={() => addItem(p)}
                                        className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-md transition-colors"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Order Summary & Client selection */}
                    <div className="w-1/2 flex flex-col overflow-hidden">
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase tracking-widest text-gray-500 flex items-center gap-1"><Store size={10} /> Fulfillment Store</label>
                                    <select
                                        value={storeId}
                                        onChange={(e) => setStoreId(e.target.value)}
                                        className="w-full bg-[#1a1a1a] border border-white/10 text-white text-xs rounded-md px-3 py-2 outline-none"
                                    >
                                        <option value="">Select Store</option>
                                        {stores.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase tracking-widest text-gray-500 flex items-center gap-1"><User size={10} /> Client (Optional)</label>
                                    <select
                                        value={customerId}
                                        onChange={(e) => setCustomerId(e.target.value)}
                                        className="w-full bg-[#1a1a1a] border border-white/10 text-white text-xs rounded-md px-3 py-2 outline-none"
                                    >
                                        <option value="">Guest Order</option>
                                        {clients.map((c: any) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col overflow-hidden min-h-[200px]">
                                <h3 className="text-[10px] uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                                    <ShoppingCart size={10} /> Items ({orderItems.length})
                                </h3>
                                <div className="flex-1 overflow-y-auto space-y-2 bg-black/30 rounded-lg p-3 border border-white/5">
                                    {orderItems.length === 0 ? (
                                        <p className="text-center text-gray-600 text-xs py-10 italic">No items added to order</p>
                                    ) : (
                                        orderItems.map((item) => (
                                            <div key={item.product_id} className="flex items-center justify-between text-xs">
                                                <div className="flex-1">
                                                    <p className="text-gray-200">{item.product_name}</p>
                                                    <p className="text-[10px] text-gray-500">${item.unit_price.toFixed(2)} × {item.quantity}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-white font-medium">${(item.unit_price * item.quantity).toFixed(2)}</span>
                                                    <button
                                                        onClick={() => removeItem(item.product_id)}
                                                        className="text-gray-600 hover:text-red-400"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5 space-y-2">
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>Subtotal</span>
                                    <span>${calculateSubtotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/5">
                                    <span>Total Estimated</span>
                                    <span className="text-green-400">${calculateSubtotal().toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={createOrderMutation.isPending || orderItems.length === 0 || !storeId}
                                className="w-full bg-[#8b1a1a] hover:bg-[#a02020] text-white py-3 rounded-md text-sm font-bold transition-all disabled:opacity-50 mt-4 shadow-lg shadow-red-900/10"
                            >
                                {createOrderMutation.isPending ? "Creating Order..." : "Place Internal Order"}
                            </button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
