import { useState } from "react";
import { X, Upload, FileType2, TerminalSquare } from "lucide-react";
import * as XLSX from "xlsx";
import Papa from "papaparse";

interface BulkImportModalProps {
    onClose: () => void;
    onImport: (data: any[]) => void;
    isPending?: boolean;
}

export default function BulkImportModal({ onClose, onImport, isPending }: BulkImportModalProps) {
    const [pasteData, setPasteData] = useState("");
    const [activeTab, setActiveTab] = useState<"paste" | "upload">("paste");
    const [preview, setPreview] = useState<any[]>([]);
    const [error, setError] = useState("");

    const expectedHeaders = ["SKU", "Product Name", "Stock Quantity", "Low Stock Threshold"];

    const extractData = (rows: any[]) => {
        if (!rows || rows.length < 1) return [];
        // Support array of arrays or array of objects
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
            // Map headers back to db fields
            const getVal = (keys: string[]) => {
                for (const k of keys) {
                    const match = Object.keys(row).find(rk => rk.toLowerCase().trim() === k.toLowerCase());
                    if (match) return row[match];
                }
                return "";
            };

            return {
                sku: getVal(["sku", "barcode", "item number", "id"]),
                name: getVal(["name", "product", "product name", "title"]),
                stock_quantity: parseInt(getVal(["stock", "stock quantity", "quantity", "qty"])) || 0,
                low_stock_threshold: parseInt(getVal(["threshold", "low stock", "low stock threshold", "min"])) || 5,
            };
        }).filter(p => p.sku || p.name);
    };

    const handlePasteProcess = () => {
        try {
            const result = Papa.parse(pasteData, { header: true, skipEmptyLines: true });
            if (result.errors.length > 0 && result.data.length === 0) {
                // Try TSV if CSV header parsing failed
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
                setError("Could not parse data. Ensure it has headers like SKU or Product Name, and Stock Quantity.");
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
                setActiveTab("paste"); // switch to preview mode implicitly
                setError("");
            } catch (err: any) {
                setError("Failed to read Excel file: " + err.message);
            }
        };
        reader.readAsBinaryString(file);
    };

    const submit = () => {
        if (preview.length === 0) return;
        onImport(preview);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#111] border border-white/10 rounded-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
                    <h2 className="font-serif font-bold text-white text-lg">Bulk Import Inventory</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 flex flex-col">
                    {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md text-sm">{error}</div>}

                    {preview.length === 0 ? (
                        <div className="space-y-4 flex-1 flex flex-col">
                            <div className="flex bg-[#1a1a1a] p-1 rounded-md mb-2 flex-shrink-0">
                                <button
                                    onClick={() => setActiveTab("paste")}
                                    className={`flex-1 py-2 text-sm font-medium rounded ${activeTab === "paste" ? "bg-[#2a2a2a] text-white shadow" : "text-gray-400 hover:text-gray-200"}`}
                                >
                                    Copy & Paste (Excel/CSV)
                                </button>
                                <button
                                    onClick={() => setActiveTab("upload")}
                                    className={`flex-1 py-2 text-sm font-medium rounded ${activeTab === "upload" ? "bg-[#2a2a2a] text-white shadow" : "text-gray-400 hover:text-gray-200"}`}
                                >
                                    Upload File (.xlsx, .csv)
                                </button>
                            </div>

                            {activeTab === "paste" && (
                                <div className="flex-1 flex flex-col min-h-[250px]">
                                    <p className="text-gray-400 text-sm mb-2">Paste your tabular data here including headers. It will automatically parse TSV/CSV formats.</p>
                                    <textarea
                                        value={pasteData}
                                        onChange={(e) => setPasteData(e.target.value)}
                                        placeholder={`SKU\tProduct Name\tStock Quantity\tLow Stock Threshold\nJD-001\tJack Daniels\t150\t20`}
                                        className="w-full flex-1 bg-[#1a1a1a] border border-white/10 rounded-md p-4 text-white text-sm focus:outline-none focus:border-[#8b1a1a] resize-none font-mono"
                                    />
                                    <div className="mt-3 flex justify-end">
                                        <button onClick={handlePasteProcess} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                                            Preview Data
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === "upload" && (
                                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg bg-[#1a1a1a]/50 p-10 mt-4 min-h-[250px]">
                                    <Upload size={32} className="text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-white font-medium mb-1">Click to upload or drag and drop</h3>
                                    <p className="text-xs text-gray-500 mb-6">XLSX, XLS, or CSV</p>
                                    <input
                                        type="file"
                                        accept=".xlsx, .xls, .csv"
                                        onChange={handleFileUpload}
                                        className="block w-full text-sm text-gray-400
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-md file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-white/10 file:text-white
                                            hover:file:bg-white/20 cursor-pointer"
                                    />
                                </div>
                            )}

                            <div className="mt-6 pt-4 border-t border-white/10">
                                <p className="text-sm font-medium text-gray-300 mb-2">Expected Column Headers:</p>
                                <div className="flex flex-wrap gap-2">
                                    {expectedHeaders.map(h => (
                                        <span key={h} className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded text-gray-400">{h}</span>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">* SKU or Product Name is required to match with existing products.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-white font-medium">Data Preview ({preview.length} valid records)</h3>
                                <button onClick={() => setPreview([])} className="text-xs text-[#8b1a1a] hover:text-[#c0392b] font-medium">
                                    Start Over
                                </button>
                            </div>
                            <div className="bg-[#1a1a1a] border border-white/10 rounded-lg overflow-x-auto">
                                <table className="w-full text-sm min-w-[700px]">
                                    <thead>
                                        <tr className="text-xs uppercase tracking-widest text-gray-500 border-b border-white/10 bg-[#151515]">
                                            <th className="px-4 py-3 text-left">SKU</th>
                                            <th className="px-4 py-3 text-left">Product Name</th>
                                            <th className="px-4 py-3 text-left">Stock Qty</th>
                                            <th className="px-4 py-3 text-left">Threshold</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {preview.slice(0, 10).map((p, i) => (
                                            <tr key={i} className="text-gray-300">
                                                <td className="px-4 py-2 text-gray-400">{p.sku || "-"}</td>
                                                <td className="px-4 py-2 truncate max-w-[200px]">{p.name || "-"}</td>
                                                <td className="px-4 py-2 font-medium">{p.stock_quantity}</td>
                                                <td className="px-4 py-2 text-gray-400">{p.low_stock_threshold}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {preview.length > 10 && (
                                    <div className="p-3 text-center text-xs text-gray-400 border-t border-white/5">
                                        + {preview.length - 10} more rows...
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-white/10 flex gap-3 flex-shrink-0">
                    <button type="button" onClick={onClose} className="flex-1 border border-white/10 text-gray-400 py-2.5 rounded-md text-sm hover:bg-white/5 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={submit}
                        disabled={preview.length === 0 || isPending}
                        className="flex-1 bg-[#8b1a1a] hover:bg-[#c0392b] text-white py-2.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:bg-[#8b1a1a]/50"
                    >
                        {isPending ? "Importing..." : `Update ${preview.length || ""} Records`}
                    </button>
                </div>
            </div>
        </div>
    );
}
