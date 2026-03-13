import { useState } from "react";
import { X, Upload, FileType2, TerminalSquare, AlertTriangle } from "lucide-react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/adminApi";

interface ImportPODialogProps {
    onClose: () => void;
    onImport: (data: any[]) => void;
    isPending?: boolean;
}

export default function ImportPODialog({ onClose, onImport, isPending }: ImportPODialogProps) {
    const [pasteData, setPasteData] = useState("");
    const [activeTab, setActiveTab] = useState<"paste" | "upload">("paste");
    const [preview, setPreview] = useState<any[]>([]);
    const [error, setError] = useState("");

    const { data: products = [] } = useQuery({ queryKey: ["admin-products"], queryFn: () => api.get("/admin/products").then((r) => r.data) });

    const extractData = (rows: any[]) => {
        if (!rows || rows.length < 1) return [];
        let parsed = [];
        if (Array.isArray(rows[0])) {
            const headers = rows[0].map((h: any) => (h || "").toString().toLowerCase().trim());
            for (let i = 1; i < rows.length; i++) {
                if (!rows[i] || rows[i].length === 0 || rows[i].every((c: any) => !c)) continue;
                const obj: any = {};
                headers.forEach((h: string, idx: number) => {
                    if (h) obj[h] = rows[i][idx];
                });
                parsed.push(obj);
            }
        } else {
            parsed = rows.filter(r => Object.keys(r).length > 0);
        }

        return parsed.map(row => {
            const getVal = (keys: string[]) => {
                for (const k of keys) {
                    const match = Object.keys(row).find(rk => rk.toLowerCase().trim() === k.toLowerCase());
                    if (match) return row[match];
                }
                return "";
            };

            const sku = (getVal(["sku", "barcode", "item number", "id"]) || "").toString().trim();
            const product = products.find((p: any) => (p.sku || "").toString().trim() === sku);
            
            return {
                sku: sku,
                product_id: product?.id,
                product_name: product?.name || "Unknown Product",
                quantity: parseInt(getVal(["quantity", "qty", "ordered"])) || 0,
                unit_cost: parseFloat(getVal(["unit cost", "cost", "price"])) || 0,
                isValid: !!product?.id
            };
        }).filter(p => p.sku || p.quantity > 0);
    };

    const handlePasteProcess = () => {
        try {
            const result = Papa.parse(pasteData, { header: true, skipEmptyLines: true });
            if (result.errors.length > 0 && result.data.length === 0) {
                const tsvResult = Papa.parse(pasteData, { delimiter: "\t", header: true, skipEmptyLines: true });
                if (tsvResult.data.length > 0) {
                    setPreview(extractData(tsvResult.data));
                    setError("");
                    return;
                }
            }
            if (result.data.length > 0) {
                setPreview(extractData(result.data));
                setError("");
            } else {
                setError("Could not parse data. Ensure it has headers like SKU, Quantity, and Unit Cost.");
            }
        } catch (err: any) {
            setError("Failed to parse: " + err.message);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: "binary" });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
                const extracted = extractData(data);
                setPreview(extracted);
                setActiveTab("paste");
                setError("");
            } catch (err: any) {
                setError("Failed to read Excel file: " + err.message);
            }
        };
        reader.readAsBinaryString(file);
    };

    const submit = () => {
        const validItems = preview.filter(p => p.isValid);
        if (validItems.length === 0) {
            setError("No valid products found matching the SKUs provided.");
            return;
        }
        onImport(validItems);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
            <div className="bg-[#111] border border-white/10 rounded-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="font-serif font-bold text-white text-lg">Import Purchase Order Items</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 flex flex-col">
                    {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md text-sm">{error}</div>}

                    {preview.length === 0 ? (
                        <div className="space-y-4 flex-1 flex flex-col">
                            <div className="flex bg-[#1a1a1a] p-1 rounded-md mb-2">
                                <button
                                    onClick={() => setActiveTab("paste")}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded ${activeTab === "paste" ? "bg-[#2a2a2a] text-white" : "text-gray-400"}`}
                                >
                                    Copy & Paste
                                </button>
                                <button
                                    onClick={() => setActiveTab("upload")}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded ${activeTab === "upload" ? "bg-[#2a2a2a] text-white" : "text-gray-400"}`}
                                >
                                    Upload File
                                </button>
                            </div>

                            {activeTab === "paste" && (
                                <div className="flex-1 flex flex-col min-h-[200px]">
                                    <textarea
                                        value={pasteData}
                                        onChange={(e) => setPasteData(e.target.value)}
                                        placeholder={`SKU\tQuantity\tUnit Cost\nJD-001\t12\t24.50\nGW-300\t24\t31.00`}
                                        className="w-full flex-1 bg-[#1a1a1a] border border-white/10 rounded-md p-4 text-white text-xs focus:outline-none focus:border-[#8b1a1a] font-mono"
                                    />
                                    <div className="mt-3 flex justify-end">
                                        <button onClick={handlePasteProcess} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md text-xs transition-colors">
                                            Preview
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === "upload" && (
                                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg p-10 min-h-[200px]">
                                    <Upload size={32} className="text-gray-500 mb-2" />
                                    <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="text-xs text-gray-400" />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-white text-sm font-medium">Preview ({preview.length} items)</h3>
                                <button onClick={() => setPreview([])} className="text-xs text-[#8b1a1a]">Clear</button>
                            </div>
                            <div className="bg-[#1a1a1a] border border-white/10 rounded-lg overflow-hidden">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-[#151515] text-gray-500 uppercase tracking-tighter">
                                        <tr>
                                            <th className="px-4 py-3">SKU</th>
                                            <th className="px-4 py-3">Product</th>
                                            <th className="px-4 py-3">Qty</th>
                                            <th className="px-4 py-3">Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {preview.map((p, i) => (
                                            <tr key={i} className={p.isValid ? "text-gray-300" : "text-red-400 bg-red-400/5"}>
                                                <td className="px-4 py-2 font-mono">{p.sku}</td>
                                                <td className="px-4 py-2 truncate max-w-[200px]">
                                                    {p.product_name}
                                                    {!p.isValid && <span className="ml-2 text-[10px] text-red-500 opacity-70 underline">Not Found</span>}
                                                </td>
                                                <td className="px-4 py-2">{p.quantity}</td>
                                                <td className="px-4 py-2">${p.unit_cost.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-white/10 flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 border border-white/10 text-gray-400 py-2 rounded-md text-sm">Cancel</button>
                    <button
                        onClick={submit}
                        disabled={preview.length === 0 || isPending}
                        className="flex-1 bg-[#8b1a1a] text-white py-2 rounded-md text-sm font-medium disabled:opacity-50"
                    >
                        {isPending ? "Adding..." : "Add to PO"}
                    </button>
                </div>
            </div>
        </div>
    );
}
