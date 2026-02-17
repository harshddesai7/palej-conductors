"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
    Search,
    Database,
    Calendar,
    Zap,
    Calculator,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SearchDatabasePage() {
    const [selectedDatabase, setSelectedDatabase] = useState<"unified" | "factor">("unified");
    const [searchQuery, setSearchQuery] = useState("");

    const unifiedData = useQuery(api.unifiedCalculations.listAll);
    const factorData = useQuery(api.factorCalculations.listAll);

    const currentData = selectedDatabase === "unified" ? unifiedData : factorData;

    const filteredData = currentData?.filter((item: any) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            item.type?.toLowerCase().includes(query) ||
            item.material?.toLowerCase().includes(query) ||
            item.shape?.toLowerCase().includes(query) ||
            item.insulationType?.toLowerCase().includes(query) ||
            JSON.stringify(item.inputs).toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Search Database</h1>
                    <p className="text-slate-500 mt-1 text-sm sm:text-base">View and search saved calculations</p>
                </div>
            </div>

            {/* Database Selector */}
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

                {/* Search Bar */}
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

            {/* Results Table */}
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
                        <p className="text-sm text-slate-500">Loading data...</p>
                    </div>
                ) : filteredData && filteredData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                    <th className="px-6 py-4 border-b border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3" /> Timestamp
                                        </div>
                                    </th>
                                    {selectedDatabase === "unified" && (
                                        <>
                                            <th className="px-6 py-4 border-b border-slate-100">Material</th>
                                            <th className="px-6 py-4 border-b border-slate-100">Shape</th>
                                            <th className="px-6 py-4 border-b border-slate-100">Mode</th>
                                            <th className="px-6 py-4 border-b border-slate-100">Insulation</th>
                                        </>
                                    )}
                                    {selectedDatabase === "factor" && (
                                        <>
                                            <th className="px-6 py-4 border-b border-slate-100">Material</th>
                                            <th className="px-6 py-4 border-b border-slate-100">Width</th>
                                            <th className="px-6 py-4 border-b border-slate-100">Thickness</th>
                                            <th className="px-6 py-4 border-b border-slate-100">Factor</th>
                                        </>
                                    )}
                                    <th className="px-6 py-4 border-b border-slate-100">Save Mode</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((item: any) => (
                                    <tr key={item._id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-6 py-4 border-b border-slate-100 text-sm text-slate-600">
                                            {item.timestamp ? new Date(item.timestamp).toLocaleString() : "—"}
                                        </td>
                                        {selectedDatabase === "unified" && (
                                            <>
                                                <td className="px-6 py-4 border-b border-slate-100 text-sm text-slate-600">
                                                    {item.material || "—"}
                                                </td>
                                                <td className="px-6 py-4 border-b border-slate-100 text-sm text-slate-600">
                                                    {item.shape || "—"}
                                                </td>
                                                <td className="px-6 py-4 border-b border-slate-100 text-sm text-slate-600">
                                                    {item.mode || "—"}
                                                </td>
                                                <td className="px-6 py-4 border-b border-slate-100 text-sm text-slate-600">
                                                    {item.insulationType || "—"}
                                                </td>
                                            </>
                                        )}
                                        {selectedDatabase === "factor" && (
                                            <>
                                                <td className="px-6 py-4 border-b border-slate-100 text-sm text-slate-600">
                                                    {item.material || "—"}
                                                </td>
                                                <td className="px-6 py-4 border-b border-slate-100 text-sm text-slate-600">
                                                    {item.inputs?.width || "—"}
                                                </td>
                                                <td className="px-6 py-4 border-b border-slate-100 text-sm text-slate-600">
                                                    {item.inputs?.thickness || "—"}
                                                </td>
                                                <td className="px-6 py-4 border-b border-slate-100 text-sm text-slate-600 font-medium">
                                                    {item.results?.factor?.toFixed(4) || "—"}
                                                </td>
                                            </>
                                        )}
                                        <td className="px-6 py-4 border-b border-slate-100">
                                            <span className={cn(
                                                "text-xs font-bold px-2 py-1 rounded-full",
                                                item.saveMode === "AUTO"
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-blue-100 text-blue-700"
                                            )}>
                                                {item.saveMode || "MANUAL"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <Database className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-sm text-slate-500">
                            {searchQuery ? "No results found" : "No calculations saved yet"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
