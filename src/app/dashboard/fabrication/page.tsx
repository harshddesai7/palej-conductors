"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
    Database,
    Search,
    Filter,
    Download,
    ArrowUpDown,
    Hash,
    Calendar,
    Ruler,
    Layers,
    Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function FabricationPage() {
    const data = useQuery(api.fabrication.list);
    const [search, setSearch] = useState("");

    const filteredData = data?.filter((item: any) =>
        item.size.toLowerCase().includes(search.toLowerCase()) ||
        item.insulationType.toLowerCase().includes(search.toLowerCase()) ||
        item.material.toLowerCase().includes(search.toLowerCase()) ||
        item.externalId?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Fabrication List</h1>
                    <p className="text-slate-500 mt-1 text-sm sm:text-base">Production logs & historical fabrication data</p>
                </div>
                <div className="flex gap-2 sm:gap-3">
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white/50 hover:bg-white text-slate-600 rounded-xl border border-white/20 transition-all text-xs sm:text-sm font-medium">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-slate-900 text-white rounded-xl shadow-lg hover:shadow-xl transition-all text-xs sm:text-sm font-medium">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                <StatCard label="Total Logs" value={data?.length || 0} icon={<Database className="w-4 h-4" />} />
                <StatCard label="DFG Runs" value={data?.filter((i: any) => i.insulationType === 'DFG').length || 0} icon={<Layers className="w-4 h-4" />} />
                <StatCard label="Avg Bare Wt" value={data ? (data.reduce((acc: number, i: any) => acc + i.bareWeight, 0) / data.length).toFixed(1) + 'kg' : '0kg'} icon={<Activity className="w-4 h-4" />} />
                <StatCard label="Last Update" value="Today" icon={<Calendar className="w-4 h-4" />} />
            </div>

            {/* Controls & Table */}
            <div className="glass rounded-3xl overflow-hidden border border-white/20 shadow-xl">
                <div className="p-4 sm:p-6 border-b border-slate-100 bg-white/30 backdrop-blur-md flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                <th className="px-6 py-4 border-b border-slate-100"><div className="flex items-center gap-2"><Hash className="w-3 h-3" /> ID</div></th>
                                <th className="px-6 py-4 border-b border-slate-100"><div className="flex items-center gap-2"><Calendar className="w-3 h-3" /> Date</div></th>
                                <th className="px-6 py-4 border-b border-slate-100"><div className="flex items-center gap-2"><Ruler className="w-3 h-3" /> Size</div></th>
                                <th className="px-6 py-4 border-b border-slate-100"><div className="flex items-center gap-2"><Layers className="w-3 h-3" /> Insulation</div></th>
                                <th className="px-6 py-4 border-b border-slate-100">Mat.</th>
                                <th className="px-6 py-4 border-b border-slate-100 text-right">Bare Wt</th>
                                <th className="px-6 py-4 border-b border-slate-100 text-right">Final Qty</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50">
                            {filteredData?.map((row: any) => (
                                <tr key={row._id} className="hover:bg-white/40 transition-colors group">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{row.externalId}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{row.date}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{row.size}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-700">{row.insulationType}</span>
                                            <span className="text-[10px] text-slate-400 font-bold">{row.coveringThickness}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter",
                                            row.material === 'Alu' ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                                        )}>
                                            {row.material}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right font-medium text-slate-600">{row.bareWeight.toFixed(1)}</td>
                                    <td className="px-6 py-4 text-sm text-right font-bold text-indigo-600">{row.finalQuantity.toFixed(1)}</td>
                                </tr>
                            ))}
                            {!data && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                        Loading historical data...
                                    </td>
                                </tr>
                            )}
                            {data && filteredData?.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                        No matching logs found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon }: any) {
    return (
        <div className="glass p-5 rounded-3xl border border-white/20 shadow-sm">
            <div className="flex items-center gap-3 text-slate-400 mb-2">
                {icon}
                <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
            </div>
            <div className="text-2xl font-black text-slate-900">{value}</div>
        </div>
    );
}
