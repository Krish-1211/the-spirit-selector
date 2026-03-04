import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export const generateInvoicePDF = (order: any, businessSettings: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header - Business Info
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(businessSettings.business_name || "Invoice", 15, 25);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    const addressLines = doc.splitTextToSize(businessSettings.business_address || "", 80);
    doc.text(addressLines, 15, 35);
    doc.text(businessSettings.business_email || "", 15, 35 + (addressLines.length * 5));

    // Invoice Details (Right Side)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("INVOICE", pageWidth - 15, 25, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`${businessSettings.invoice_prefix || "INV-"}${order.order_number}`, pageWidth - 15, 35, { align: "right" });
    doc.text(`Date: ${format(new Date(order.created_at), "MMMM d, yyyy")}`, pageWidth - 15, 42, { align: "right" });
    doc.text(`Status: ${order.status.toUpperCase()}`, pageWidth - 15, 49, { align: "right" });

    // Bill To
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", 15, 75);
    doc.setFont("helvetica", "normal");
    doc.text(`${order.first_name} ${order.last_name}`, 15, 82);
    doc.text(order.customer_email || "", 15, 87);
    if (order.delivery_address) {
        const deliveryLines = doc.splitTextToSize(order.delivery_address, 80);
        doc.text(deliveryLines, 15, 94);
    }

    // Table
    const tableData = order.items.map((item: any) => [
        item.product_name,
        item.quantity.toString(),
        `$${parseFloat(item.unit_price).toFixed(2)}`,
        `$${parseFloat(item.line_total).toFixed(2)}`
    ]);

    autoTable(doc, {
        startY: 110,
        head: [["Product", "Qty", "Unit Price", "Total"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillGray: true, textColor: 255 },
        styles: { fontSize: 9, cellPadding: 5 }
    });

    // Summary
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal:", pageWidth - 50, finalY);
    doc.text(`$${parseFloat(order.subtotal).toFixed(2)}`, pageWidth - 15, finalY, { align: "right" });

    doc.text(`Tax (${(parseFloat(businessSettings.tax_rate || 0) * 100).toFixed(0)}%):`, pageWidth - 50, finalY + 7);
    doc.text(`$${parseFloat(order.tax).toFixed(2)}`, pageWidth - 15, finalY + 7, { align: "right" });

    if (parseFloat(order.delivery_fee) > 0) {
        doc.text("Delivery Fee:", pageWidth - 50, finalY + 14);
        doc.text(`$${parseFloat(order.delivery_fee).toFixed(2)}`, pageWidth - 15, finalY + 14, { align: "right" });
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    const totalY = finalY + (parseFloat(order.delivery_fee) > 0 ? 25 : 18);
    doc.text("TOTAL:", pageWidth - 50, totalY);
    doc.text(`$${parseFloat(order.total).toFixed(2)}`, pageWidth - 15, totalY, { align: "right" });

    // Footer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("Thank you for your business!", pageWidth / 2, pageWidth === 210 ? 280 : 260, { align: "center" });

    doc.save(`Invoice-${order.order_number}.pdf`);
};
