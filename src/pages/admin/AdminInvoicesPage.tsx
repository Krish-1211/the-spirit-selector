import { useQuery } from "@tanstack/react-query";
import adminApi from "@/lib/adminApi";
import { FileText, Download, Eye, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { generateInvoicePDF } from "@/lib/pdfGenerator";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function AdminInvoicesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    const { data: orders = [], isLoading: ordersLoading } = useQuery({
        queryKey: ["a-orders-invoices"],
        queryFn: () => adminApi.get("/admin/orders").then((r) => r.data),
    });

    const { data: orderDetails, isLoading: detailsLoading } = useQuery({
        queryKey: ["a-order-detail", selectedOrder?.id],
        queryFn: () => adminApi.get(`/admin/orders/${selectedOrder.id}`).then((r) => r.data),
        enabled: !!selectedOrder,
    });

    const { data: settings } = useQuery({
        queryKey: ["a-settings"],
        queryFn: () => adminApi.get("/admin/settings").then((r) => r.data),
    });

    const filteredOrders = orders.filter((o: any) =>
        o.order_number.toString().includes(searchTerm) ||
        (o.first_name + " " + o.last_name).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDownload = (order: any) => {
        // If we have full details, use them, otherwise we need to fetch them
        if (orderDetails && orderDetails.id === order.id) {
            generateInvoicePDF(orderDetails, settings || {});
        } else {
            adminApi.get(`/admin/orders/${order.id}`).then(res => {
                generateInvoicePDF(res.data, settings || {});
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">Invoice Management</h1>
                    <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Generate and track professional invoices for client orders</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Order # or Customer Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#111] border border-white/10 rounded-md pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                    />
                </div>
                <button className="bg-[#111] border border-white/10 rounded-md px-4 py-2 text-sm text-gray-400 flex items-center justify-center gap-2 hover:bg-white/5 transition-colors w-full sm:w-auto">
                    <Filter size={16} /> Filter
                </button>
            </div>

            <div className="bg-[#111] border border-white/5 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[700px]">
                        <thead>
                            <tr className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-600 border-b border-white/5 bg-white/5">
                                <th className="px-4 sm:px-6 py-4 text-left">Invoice / Order #</th>
                                <th className="px-4 sm:px-6 py-4 text-left">Customer</th>
                                <th className="px-4 sm:px-6 py-4 text-left">Date</th>
                                <th className="px-4 sm:px-6 py-4 text-left">Amount</th>
                                <th className="px-4 sm:px-6 py-4 text-left">Status</th>
                                <th className="px-4 sm:px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {ordersLoading ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading orders...</td></tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No matching orders found</td></tr>
                            ) : (
                                filteredOrders.map((order: any) => (
                                    <tr key={order.id} className="text-gray-300 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-4 sm:px-6 py-4">
                                            <span className="font-mono text-white text-xs sm:text-sm">#{order.order_number}</span>
                                            <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-tighter sm:tracking-widest">Generated {format(new Date(order.created_at), "MMM d")}</p>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4">
                                            <div className="text-xs sm:text-sm font-medium text-gray-200">{order.first_name} {order.last_name}</div>
                                            <div className="text-[10px] sm:text-xs text-gray-500">{order.customer_email}</div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-[10px] sm:text-xs text-gray-400 whitespace-nowrap">
                                            {format(new Date(order.created_at), "MMMM d, yyyy")}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-white font-medium text-xs sm:text-sm">
                                            ${parseFloat(order.total).toFixed(2)}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${order.status === 'delivered' ? 'bg-green-500/10 text-green-500' :
                                                order.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                                                    'bg-blue-500/10 text-blue-400'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="p-1.5 sm:p-2 hover:bg-white/5 rounded-md text-gray-400 hover:text-white transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(order)}
                                                    className="p-1.5 sm:p-2 hover:bg-blue-500/10 rounded-md text-blue-400 hover:text-blue-300 transition-colors"
                                                    title="Download PDF"
                                                >
                                                    <Download size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="bg-[#0f0f0f] border-white/10 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-serif flex items-center gap-2 border-b border-white/5 pb-4">
                            <FileText className="text-blue-400" />
                            Invoice Details #{selectedOrder?.order_number}
                        </DialogTitle>
                    </DialogHeader>

                    {detailsLoading ? (
                        <div className="py-20 text-center text-gray-500">Fetching invoice items...</div>
                    ) : orderDetails ? (
                        <div className="space-y-8 pt-4">
                            <div className="grid grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-2">Customer Info</h3>
                                        <p className="text-white font-medium">{orderDetails.first_name} {orderDetails.last_name}</p>
                                        <p className="text-sm text-gray-400">{orderDetails.customer_email}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-2">Billing / Shipping</h3>
                                        <p className="text-sm text-gray-400 whitespace-pre-wrap">{orderDetails.delivery_address || "No address provided"}</p>
                                        <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-widest">{orderDetails.delivery_type}</p>
                                    </div>
                                </div>
                                <div className="space-y-4 text-right">
                                    <div>
                                        <h3 className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-2">Invoice Details</h3>
                                        <p className="text-sm text-gray-300">Date: {format(new Date(orderDetails.created_at), "MMMM d, yyyy")}</p>
                                        <p className="text-sm text-gray-300">Order Method: Online Store</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border border-white/5 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-white/5 border-b border-white/5">
                                        <tr className="text-[10px] uppercase text-gray-500">
                                            <th className="px-4 py-3 text-left font-semibold">Description</th>
                                            <th className="px-4 py-3 text-center font-semibold">Qty</th>
                                            <th className="px-4 py-3 text-right font-semibold">Unit Price</th>
                                            <th className="px-4 py-3 text-right font-semibold">Line Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {orderDetails.items.map((item: any) => (
                                            <tr key={item.id} className="text-gray-300">
                                                <td className="px-4 py-3 italic">{item.product_name}</td>
                                                <td className="px-4 py-3 text-center">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right">${parseFloat(item.unit_price).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right text-white">${parseFloat(item.line_total).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end">
                                <div className="w-64 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="text-gray-200">${parseFloat(orderDetails.subtotal).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Tax</span>
                                        <span className="text-gray-200">${parseFloat(orderDetails.tax).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Delivery Fee</span>
                                        <span className="text-gray-200">${parseFloat(orderDetails.delivery_fee).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold border-t border-white/10 pt-2 mt-2">
                                        <span className="text-white">Total</span>
                                        <span className="text-green-400">${parseFloat(orderDetails.total).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                                <button
                                    onClick={() => handleDownload(orderDetails)}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    <Download size={16} /> Download Invoice
                                </button>
                            </div>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
        </div>
    );
}
