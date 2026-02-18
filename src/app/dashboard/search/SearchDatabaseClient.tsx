"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
    Search,
    Database,
    Calendar,
    Zap,
    Calculator,
    Loader2,
    ArrowUp,
    ArrowDown,
    ArrowUpDown
} from "lucide-react";
import { cn } from "@/lib/utils";

type SortColumn = string | null;
type SortDirection = "asc" | "desc";

export default function SearchDatabaseClient() {
    const [selectedDatabase, setSelectedDatabase] = useState<"unified" | "factor">("unified");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortColumn, setSortColumn] = useState<SortColumn>("timestamp");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    const unifiedData = useQuery(api.unifiedCalculations.listAll);
    const factorData = useQuery(api.factorCalculations.listAll);

    const currentData = selectedDatabase === "unified" ? unifiedData : factorData;

    const safeStringify = (obj: unknown): string => {
        try {
            return typeof obj === "object" && obj !== null ? JSON.stringify(obj) : String(obj ?? "");
        } catch {
            return "";
        }
    };

    const filteredData = useMemo(() => {
        if (!currentData || !Array.isArray(currentData)) return [];
        try {
            return currentData.filter((item: any) => {
                if (!searchQuery) return true;
                const query = searchQuery.toLowerCase();
                const str = (v: unknown) => (v != null ? String(v).toLowerCase() : "");
                return (
                    str(item.material).includes(query) ||
                    str(item.shape).includes(query) ||
                    str(item.mode).includes(query) ||
                    str(item.insulationType).includes(query) ||
                    safeStringify(item.inputs).toLowerCase().includes(query) ||
                    safeStringify(item.results).toLowerCase().includes(query)
                );
            });
        } catch {
            return [];
        }
    }, [currentData, searchQuery]);

    const sortedData = useMemo(() => {
        if (!sortColumn || !filteredData) return filteredData || [];
        const sorted = [...filteredData];
        sorted.sort((a: any, b: any) => {
            let aVal: any, bVal: any;
            
            switch (sortColumn) {
                case "timestamp":
                    aVal = a.timestamp || 0;
                    bVal = b.timestamp || 0;
                    return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
                
                case "material":
                case "shape":
                case "mode":
                case "insulationType":
                case "kV":
                    aVal = String(a[sortColumn] ?? "").toLowerCase();
                    bVal = String(b[sortColumn] ?? "").toLowerCase();
                    return sortDirection === "asc" 
                        ? aVal.localeCompare(bVal)
                        : bVal.localeCompare(aVal);
                
                case "size":
                    aVal = a.results?.bareArea || 0;
                    bVal = b.results?.bareArea || 0;
                    return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
                
                case "percentIncrease":
                    aVal = a.results?.percentIncrease || 0;
                    bVal = b.results?.percentIncrease || 0;
                    return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
                
                case "factor":
                    aVal = a.inputs?.factor || a.results?.factor || 0;
                    bVal = b.inputs?.factor || b.results?.factor || 0;
                    return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
                
                case "bareWtReqd":
                    aVal = a.results?.bareWtReqd || 0;
                    bVal = b.results?.bareWtReqd || 0;
                    return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
                
                case "totalWeight":
                    aVal = a.inputs?.finalWtReqd || 0;
                    bVal = b.inputs?.finalWtReqd || 0;
                    return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
                
                case "metersPerSpool":
                    aVal = a.results?.metersPerSpool || 0;
                    bVal = b.results?.metersPerSpool || 0;
                    return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
                
                case "production":
                    aVal = a.results?.productionKgHr || 0;
                    bVal = b.results?.productionKgHr || 0;
                    return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
                
                case "totalHours":
                    aVal = a.results?.totalHoursReqd || 0;
                    bVal = b.results?.totalHoursReqd || 0;
                    return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
                
                case "covering":
                    aVal = a.inputs?.covering || 0;
                    bVal = b.inputs?.covering || 0;
                    return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
                
                case "percentageIncrease":
                    aVal = a.inputs?.percentageIncrease || 0;
                    bVal = b.inputs?.percentageIncrease || 0;
                    return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
                
                default:
                    return 0;
            }
        });
        return sorted;
    }, [filteredData, sortColumn, sortDirection]);

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    const getSortIcon = (column: string) => {
        if (sortColumn !== column) {
            return <ArrowUpDown className="w-3 h-3 opacity-30" />;
        }
        return sortDirection === "asc" 
            ? <ArrowUp className="w-3 h-3" />
            : <ArrowDown className="w-3 h-3" />;
    };

    const formatSize = (item: any) => {
        const shape = item.shape;
        const inputs = item.inputs || {};
        const results = item.results || {};
        
        if (shape === "STRIP") {
            const w = inputs.width || 0;
            const t = inputs.thickness || 0;
            const bareArea = results.bareArea || 0;
            if (w > 0 && t > 0) {
                return `${w}×${t} (${bareArea.toFixed(2)} mm²)`;
            }
        } else if (shape === "WIRE") {
            const d = inputs.dia || 0;
            const bareArea = results.bareArea || 0;
            if (d > 0) {
                return `${d} (${bareArea.toFixed(2)} mm²)`;
            }
        }
        return "—";
    };

    const formatInsulationThickness = (item: any) => {
        const inputs = item.inputs || {};
        const isDual = inputs.polyCov && inputs.dfgCov;
        
        if (isDual) {
            const poly = inputs.polyCov || 0;
            const dfg = inputs.dfgCov || 0;
            return `P:${poly} D:${dfg}`;
        } else {
            const single = inputs.insulationThickness || 0;
            return single > 0 ? single.toString() : "—";
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Search Database</h1>
                    <p className="text-slate-500 mt-1 text-sm sm:text-base">View and search saved calculations</p>
                </div>
            </div>

            <div className="glass p-5 sm:p-8 rounded-3xl space-y-6">
                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Select Database</label>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setSelectedDatabase("unified")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all text-sm font-bold",
                                selectedDatabase === "unified"
                                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                                    : "bg-white/50 text-slate-600 border-slate-200 hover:bg-white"
                            )}
                        >
                            <Zap className="w-4 h-4" />
                            Unified Calculator Database
                        </button>
                        <button
                            onClick={() => setSelectedDatabase("factor")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all text-sm font-bold",
                                selectedDatabase === "factor"
                                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                                    : "bg-white/50 text-slate-600 border-slate-200 hover:bg-white"
                            )}
                        >
                            <Calculator className="w-4 h-4" />
                            Factor Calculator Database
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder={`Search ${selectedDatabase === "unified" ? "Unified" : "Factor"} calculations...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all text-sm"
                    />
                </div>
            </div>

            <div className="glass rounded-3xl overflow-hidden border border-white/20 shadow-xl">
                <div className="p-4 sm:p-6 border-b border-slate-100 bg-white/30 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">
                            {selectedDatabase === "unified" ? "Unified" : "Factor"} Calculations
                        </h2>
                        <span className="text-xs text-slate-400">
                            {filteredData?.length || 0} {filteredData?.length === 1 ? "record" : "records"}
                        </span>
                    </div>
                </div>

                {currentData === undefined ? (
                    <div className="p-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-4" />
                        <p className="text-xs text-slate-500">Loading data...</p>
                    </div>
                ) : sortedData && sortedData.length > 0 ? (
                    <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-400px)]">
                        <table className="w-full text-left border-collapse min-w-max">
                            <thead className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-sm">
                                <tr className="bg-slate-50/95 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                                    {selectedDatabase === "unified" && (
                                        <>
                                            <th className="sticky left-0 z-30 bg-slate-50/95 px-3 py-2 border-b border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("timestamp")}>
                                                <div className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /><span>Timestamp</span>{getSortIcon("timestamp")}</div>
                                            </th>
                                            <th className="px-3 py-2 border-b border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("material")}>
                                                <div className="flex items-center gap-1"><span>Material</span>{getSortIcon("material")}</div>
                                            </th>
                                            <th className="px-3 py-2 border-b border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("shape")}>
                                                <div className="flex items-center gap-1"><span>Shape</span>{getSortIcon("shape")}</div>
                                            </th>
                                            <th className="px-3 py-2 border-b border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("mode")}>
                                                <div className="flex items-center gap-1"><span>Mode</span>{getSortIcon("mode")}</div>
                                            </th>
                                            <th className="px-3 py-2 border-b border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("size")}>
                                                <div className="flex items-center gap-1"><span>Size</span>{getSortIcon("size")}</div>
                                            </th>
                                            <th className="px-3 py-2 border-b border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("insulationType")}>
                                                <div className="flex items-center gap-1"><span>Insulation</span>{getSortIcon("insulationType")}</div>
                                            </th>
                                            <th className="px-3 py-2 border-b border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("kV")}>
                                                <div className="flex items-center gap-1"><span>kV</span>{getSortIcon("kV")}</div>
                                            </th>
                                            <th className="px-3 py-2 border-b border-slate-100">Ins Thk</th>
                                            <th className="px-3 py-2 border-b border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("factor")}>
                                                <div className="flex items-center gap-1"><span>Factor</span>{getSortIcon("factor")}</div>
                                            </th>
                                            <th className="px-3 py-2 border-b border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("percentIncrease")}>
                                                <div className="flex items-center gap-1"><span>% Inc</span>{getSortIcon("percentIncrease")}</div>
                                            </th>
                                            <th className="px-3 py-2 border-b border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("bareWtReqd")}>
                                                <div className="flex items-center gap-1"><span>Bare Wt</span>{getSortIcon("bareWtReqd")}</div>
                                            </th>
                                            <th className="px-3 py-2 border-b border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("totalWeight")}>
                                                <div className="flex items-center gap-1"><span>Total Wt</span>{getSortIcon("totalWeight")}</div>
                                            </th>
                                            <th className="px-3 py-2 border-b border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("metersPerSpool")}>
                                                <div className="flex items-center gap-1"><span>M/Spool</span>{getSortIcon("metersPerSpool")}</div>
                                            </th>
                                            <th className="px-3 py-2 border-b border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("production")}>
                                                <div className="flex items-center gap-1"><span>Production</span>{getSortIcon("production")}</div>
                                            </th>
                                            <th className="px-3 py-2 border-b border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("totalHours")}>
                                                <div className="flex items-center gap-1"><span>Hours</span>{getSortIcon("totalHours")}</div>
                                            </th>
                                            <th className="px-3 py-2 border-b border-slate-100">Save</th>
                                        </>
                                    )}
                                    {selectedDatabase === "factor" && (
                                        <>
                                            <th className="sticky left-0 z-30 bg-slate-50/95 px-3 py-2 border-b border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("timestamp")}>
                                                <div className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /><span>Timestamp</span>{getSortIcon("timestamp")}</div>
                                            </th>
                                            <th className="px-3 py-2 border-b border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("material")}>
                                                <div className="flex items-center gap-1"><span>Material</span>{getSortIcon("material")}</div>
                                            </th>
                                            <th className="px-3 py-2 border-b border-slate-100">Size</th>
                                            <th className="px-3 py-2 border-b border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("covering")}>
                                                <div className="flex items-center gap-1"><span>Covering</span>{getSortIcon("covering")}</div>
                                            </th>
                                            <th className="px-3 py-2 border-b border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("percentageIncrease")}>
                                                <div className="flex items-center gap-1"><span>% Inc</span>{getSortIcon("percentageIncrease")}</div>
                                            </th>
                                            <th className="px-3 py-2 border-b border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort("factor")}>
                                                <div className="flex items-center gap-1"><span>Factor</span>{getSortIcon("factor")}</div>
                                            </th>
                                            <th className="px-3 py-2 border-b border-slate-100">Save</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {sortedData.map((item: any) => (
                                    <tr key={item._id} className="hover:bg-slate-50/30 transition-colors">
                                        {selectedDatabase === "unified" && (
                                            <>
                                                <td className="sticky left-0 z-20 bg-white/95 backdrop-blur-sm px-3 py-2 border-b border-slate-100 text-xs text-slate-600 whitespace-nowrap">
                                                    {item.timestamp ? new Date(item.timestamp).toLocaleString() : "—"}
                                                </td>
                                                <td className="px-3 py-2 border-b border-slate-100 text-xs text-slate-600 whitespace-nowrap">{item.material || "—"}</td>
                                                <td className="px-3 py-2 border-b border-slate-100 text-xs text-slate-600 whitespace-nowrap">{item.shape || "—"}</td>
                                                <td className="px-3 py-2 border-b border-slate-100 text-xs text-slate-600 whitespace-nowrap">{item.mode || "—"}</td>
                                                <td className="px-3 py-2 border-b border-slate-100 text-xs text-slate-600 whitespace-nowrap">{formatSize(item)}</td>
                                                <td className="px-3 py-2 border-b border-slate-100 text-xs text-slate-600 whitespace-nowrap">{item.insulationType || "—"}</td>
                                                <td className="px-3 py-2 border-b border-slate-100 text-xs text-slate-600 whitespace-nowrap">{item.kV || "—"}</td>
                                                <td className="px-3 py-2 border-b border-slate-100 text-xs text-slate-600 whitespace-nowrap">{formatInsulationThickness(item)}</td>
                                                <td className="px-3 py-2 border-b border-slate-100 text-xs text-slate-600 whitespace-nowrap">{item.inputs?.factor ? item.inputs.factor.toFixed(4) : "—"}</td>
                                                <td className="px-3 py-2 border-b border-slate-100 text-xs text-slate-600 whitespace-nowrap">{item.results?.percentIncrease ? `${item.results.percentIncrease.toFixed(2)}%` : "—"}</td>
                                                <td className="px-3 py-2 border-b border-slate-100 text-xs text-slate-600 whitespace-nowrap">{item.results?.bareWtReqd ? `${item.results.bareWtReqd.toFixed(2)} kg` : "—"}</td>
                                                <td className="px-3 py-2 border-b border-slate-100 text-xs text-slate-600 whitespace-nowrap">{item.inputs?.finalWtReqd ? `${item.inputs.finalWtReqd.toFixed(2)} kg` : "—"}</td>
                                                <td className="px-3 py-2 border-b border-slate-100 text-xs text-slate-600 whitespace-nowrap">{item.results?.metersPerSpool ? `${item.results.metersPerSpool.toFixed(0)} m` : "—"}</td>
                                                <td className="px-3 py-2 border-b border-slate-100 text-xs text-slate-600 whitespace-nowrap">{item.results?.productionKgHr ? `${item.results.productionKgHr.toFixed(2)} kg/hr` : "—"}</td>
                                                <td className="px-3 py-2 border-b border-slate-100 text-xs text-slate-600 whitespace-nowrap">{item.results?.totalHoursReqd ? `${item.results.totalHoursReqd.toFixed(2)} hrs` : "—"}</td>
                                                <td className="px-3 py-2 border-b border-slate-100">
                                                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap", item.saveMode === "AUTO" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700")}>{item.saveMode || "MANUAL"}</span>
                                                </td>
                                            </>
                                        )}
                                        {selectedDatabase === "factor" && (
                                            <>
                                                <td className="sticky left-0 z-20 bg-white/95 backdrop-blur-sm px-3 py-2 border-b border-slate-100 text-xs text-slate-600 whitespace-nowrap">
                                                    {item.timestamp ? new Date(item.timestamp).toLocaleString() : "—"}
                                                </td>
                                                <td className="px-3 py-2 border-b border-slate-100 text-xs text-slate-600 whitespace-nowrap">{item.material || "—"}</td>
                                                <td className="px-3 py-2 border-b border-slate-100 text-xs text-slate-600 whitespace-nowrap">{item.inputs?.width && item.inputs?.thickness ? `${item.inputs.width}×${item.inputs.thickness}` : "—"}</td>
                                                <td className="px-3 py-2 border-b border-slate-100 text-xs text-slate-600 whitespace-nowrap">{item.inputs?.covering ? `${item.inputs.covering.toFixed(2)} mm` : "—"}</td>
                                                <td className="px-3 py-2 border-b border-slate-100 text-xs text-slate-600 whitespace-nowrap">{item.inputs?.percentageIncrease ? `${item.inputs.percentageIncrease.toFixed(2)}%` : "—"}</td>
                                                <td className="px-3 py-2 border-b border-slate-100 text-xs text-slate-600 whitespace-nowrap font-medium">{item.results?.factor ? item.results.factor.toFixed(6) : "—"}</td>
                                                <td className="px-3 py-2 border-b border-slate-100">
                                                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap", item.saveMode === "AUTO" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700")}>{item.saveMode || "MANUAL"}</span>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <Database className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-xs text-slate-500">
                            {searchQuery ? "No results found" : "No calculations saved yet"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
