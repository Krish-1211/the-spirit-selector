import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminApi from "@/lib/adminApi";
import { Save, Info, Bell, Shield, Building2, Landmark, Quote } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<Record<string, string>>({});

    const { data: settings, isLoading } = useQuery({
        queryKey: ["a-settings"],
        queryFn: () => adminApi.get("/admin/settings").then((r) => r.data),
    });

    useEffect(() => {
        if (settings) {
            setFormData(settings);
        }
    }, [settings]);

    const updateMutation = useMutation({
        mutationFn: (data: Record<string, string>) => adminApi.put("/admin/settings", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["a-settings"] });
            toast.success("Settings updated successfully");
        },
        onError: () => {
            toast.error("Failed to update settings");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate(formData);
    };

    if (isLoading) return <div className="text-gray-500 py-10 text-center">Loading settings...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-white">System Settings</h1>
                    <p className="text-gray-500 text-sm mt-1">Configure business identity and platform preferences</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Business Identity */}
                <div className="bg-[#111] border border-white/5 rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-2">
                        <Building2 size={16} className="text-blue-400" />
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-300">Business Identity</h2>
                    </div>
                    <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Company Name</label>
                            <input
                                type="text"
                                value={formData.business_name || ""}
                                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded-md px-4 py-2.5 text-xs sm:text-sm text-white focus:border-blue-500/50 outline-none transition-colors"
                                placeholder="e.g. Sure Seal Sealants"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Support Email</label>
                            <input
                                type="email"
                                value={formData.business_email || ""}
                                onChange={(e) => setFormData({ ...formData, business_email: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded-md px-4 py-2.5 text-xs sm:text-sm text-white focus:border-blue-500/50 outline-none transition-colors"
                                placeholder="billing@company.com"
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <label className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Physical Address</label>
                            <textarea
                                value={formData.business_address || ""}
                                onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded-md px-4 py-2.5 text-xs sm:text-sm text-white focus:border-blue-500/50 outline-none transition-colors h-24 resize-none"
                                placeholder="Enter full business address"
                            />
                        </div>
                    </div>
                </div>

                {/* Financial Prefrences */}
                <div className="bg-[#111] border border-white/5 rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-2">
                        <Landmark size={16} className="text-green-400" />
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-300">Financial Preferences</h2>
                    </div>
                    <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Currency</label>
                            <select
                                value={formData.currency || "USD"}
                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded-md px-4 py-2.5 text-xs sm:text-sm text-white focus:border-green-500/50 outline-none transition-colors"
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="AUD">AUD ($)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Tax Rate (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.tax_rate || ""}
                                onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded-md px-4 py-2.5 text-xs sm:text-sm text-white focus:border-green-500/50 outline-none transition-colors"
                                placeholder="0.10"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Invoice Prefix</label>
                            <input
                                type="text"
                                value={formData.invoice_prefix || ""}
                                onChange={(e) => setFormData({ ...formData, invoice_prefix: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded-md px-4 py-2.5 text-xs sm:text-sm text-white focus:border-green-500/50 outline-none transition-colors"
                                placeholder="INV-"
                            />
                        </div>
                    </div>
                </div>

                {/* Notifications & Security */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-[#111] border border-white/5 rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-2">
                            <Bell size={16} className="text-purple-400" />
                            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-300">Notifications</h2>
                        </div>
                        <div className="p-4 sm:p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">Low Stock Alerts</span>
                                <div
                                    className={`w-8 h-4 rounded-full transition-colors cursor-pointer ${formData.notify_low_stock === "true" ? "bg-purple-500" : "bg-gray-700"}`}
                                    onClick={() => setFormData({ ...formData, notify_low_stock: formData.notify_low_stock === "true" ? "false" : "true" })}
                                >
                                    <div className={`w-3 h-3 bg-white rounded-full mt-0.5 transition-transform ${formData.notify_low_stock === "true" ? "translate-x-4.5" : "translate-x-0.5"}`} />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">New Order Emails</span>
                                <div
                                    className={`w-8 h-4 rounded-full transition-colors cursor-pointer ${formData.notify_new_order === "true" ? "bg-purple-500" : "bg-gray-700"}`}
                                    onClick={() => setFormData({ ...formData, notify_new_order: formData.notify_new_order === "true" ? "false" : "true" })}
                                >
                                    <div className={`w-3 h-3 bg-white rounded-full mt-0.5 transition-transform ${formData.notify_new_order === "true" ? "translate-x-4.5" : "translate-x-0.5"}`} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#111] border border-white/5 rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-2">
                            <Shield size={16} className="text-red-400" />
                            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-300">Security</h2>
                        </div>
                        <div className="p-4 sm:p-6 space-y-4">
                            <button
                                type="button"
                                className="w-full text-left text-xs text-gray-400 hover:text-white transition-colors flex items-center justify-between group"
                            >
                                <span>Change Admin Password</span>
                                <Info size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-2 bg-[#8b1a1a] hover:bg-[#a02020] text-white px-8 py-3 rounded-md font-medium transition-colors disabled:opacity-50"
                    >
                        <Save size={18} />
                        {updateMutation.isPending ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
