import { useQuery } from "@tanstack/react-query";
import adminApi from "@/lib/adminApi";
import { Users, Mail, Phone, Calendar, ShoppingBag } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function AdminClientsPage() {
    const [selectedClient, setSelectedClient] = useState<any>(null);

    const { data: clients = [], isLoading } = useQuery({
        queryKey: ["a-customers"],
        queryFn: () => adminApi.get("/admin/customers").then((r) => r.data),
    });

    const { data: clientDetails } = useQuery({
        queryKey: ["a-customer", selectedClient?.id],
        queryFn: () => adminApi.get(`/admin/customers/${selectedClient.id}`).then((r) => r.data),
        enabled: !!selectedClient,
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-white">Client Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your customer database and view history</p>
                </div>
            </div>

            <div className="bg-[#111] border border-white/5 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[700px]">
                        <thead>
                            <tr className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-600 border-b border-white/5 bg-white/5">
                                <th className="px-4 sm:px-6 py-4 text-left">Client Name</th>
                                <th className="px-4 sm:px-6 py-4 text-left">Email / Phone</th>
                                <th className="px-4 sm:px-6 py-4 text-left sm:text-center">Orders</th>
                                <th className="px-4 sm:px-6 py-4 text-left sm:text-right">Total Spent</th>
                                <th className="px-4 sm:px-6 py-4 text-left sm:text-right">Registered</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading clients...</td></tr>
                            ) : clients.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No clients found</td></tr>
                            ) : (
                                clients.map((client: any) => (
                                    <tr
                                        key={client.id}
                                        className="text-gray-300 hover:bg-white/[0.02] cursor-pointer transition-colors"
                                        onClick={() => setSelectedClient(client)}
                                    >
                                        <td className="px-4 sm:px-6 py-4 text-white font-medium text-xs sm:text-sm">
                                            {client.first_name} {client.last_name}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="flex items-center gap-1.5 text-[10px] sm:text-xs"><Mail size={12} className="text-gray-500" /> {client.email}</span>
                                                {client.phone && <span className="flex items-center gap-1.5 text-[10px] text-gray-500"><Phone size={10} /> {client.phone}</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 sm:text-center">
                                            <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[10px] sm:text-xs">
                                                {client.total_orders}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 sm:text-right text-green-400 font-medium text-xs sm:text-sm">
                                            ${parseFloat(client.total_spent || 0).toFixed(2)}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 sm:text-right text-[10px] sm:text-xs text-gray-500">
                                            {format(new Date(client.created_at), "MMM d, yyyy")}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={!!selectedClient} onOpenChange={(open) => !open && setSelectedClient(null)}>
                <DialogContent className="bg-[#0f0f0f] border-white/10 text-white max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-serif border-b border-white/5 pb-4">Client Profile</DialogTitle>
                    </DialogHeader>

                    {clientDetails ? (
                        <div className="space-y-6 pt-4">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Full Name</p>
                                        <p className="text-white font-medium">{clientDetails.first_name} {clientDetails.last_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Email Address</p>
                                        <p className="text-white">{clientDetails.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Phone Number</p>
                                        <p className="text-white">{clientDetails.phone || "—"}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Billing Address</p>
                                        <p className="text-white text-sm whitespace-pre-wrap">{clientDetails.address || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Member Since</p>
                                        <p className="text-white">{format(new Date(clientDetails.created_at), "MMMM d, yyyy")}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                    <ShoppingBag size={14} /> Order History
                                </h3>
                                <div className="max-h-60 overflow-y-auto rounded-lg border border-white/5 bg-black/20">
                                    <table className="w-full text-xs">
                                        <thead className="sticky top-0 bg-[#1a1a1a] text-gray-500">
                                            <tr>
                                                <th className="px-4 py-2 text-left font-normal uppercase">Order #</th>
                                                <th className="px-4 py-2 text-left font-normal uppercase">Date</th>
                                                <th className="px-4 py-2 text-left font-normal uppercase">Status</th>
                                                <th className="px-4 py-2 text-right font-normal uppercase">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {clientDetails.orders?.length > 0 ? (
                                                clientDetails.orders.map((order: any) => (
                                                    <tr key={order.id} className="hover:bg-white/5">
                                                        <td className="px-4 py-2 font-mono text-gray-300">#{order.order_number}</td>
                                                        <td className="px-4 py-2 text-gray-400">{format(new Date(order.created_at), "MMM d, yyyy")}</td>
                                                        <td className="px-4 py-2">
                                                            <span className={`px-1.5 py-0.5 rounded-sm capitalize ${order.status === 'delivered' ? 'bg-green-500/10 text-green-400' :
                                                                order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                                                                    'bg-blue-500/10 text-blue-400'
                                                                }`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2 text-right font-medium text-white">${parseFloat(order.total).toFixed(2)}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-600 italic text-xs">No orders yet</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-20 text-center text-gray-500">Loading profile details...</div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
