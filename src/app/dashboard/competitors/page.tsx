"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
    Plus,
    History
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CompetitorsPage() {
    const data = useQuery(api.competitor_rates.list);
    const addRate = useMutation(api.competitor_rates.add);

    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState({
        competitorName: "",
        material: "ALUMINIUM",
        baseRate: 0,
        premium: 0,
        date: new Date().toISOString().split('T')[0],
        notes: ""
    });

    const effectiveRate = Number(form.baseRate) + Number(form.premium);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAdding(true);
        try {
            await addRate({
                ...form,
                effectiveRate,
                baseRate: Number(form.baseRate),
                premium: Number(form.premium)
            });
            setForm({
                competitorName: "",
                material: "ALUMINIUM",
                baseRate: 0,
                premium: 0,
                date: new Date().toISOString().split('T')[0],
                notes: ""
            });
            alert("Rate added!");
        } catch (err) {
            console.error(err);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Competitor Rates</h1>
                    <p className="text-slate-500 mt-1 text-sm sm:text-base">Track market intelligence & pricing trends</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Entry Form */}
                <div className="lg:col-span-1 glass p-6 sm:p-8 rounded-3xl h-fit border border-white/20">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Entry
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <InputGroup
                            label="Competitor Name"
                            value={form.competitorName}
                            onChange={(e: any) => setForm({ ...form, competitorName: e.target.value })}
                            placeholder="e.g. Hindalco"
                            type="text"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Material</label>
                                <select
                                    className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold"
                                    value={form.material}
                                    onChange={(e) => setForm({ ...form, material: e.target.value })}
                                >
                                    <option value="ALUMINIUM">Alu</option>
                                    <option value="COPPER">Copper</option>
                                </select>
                            </div>
                            <InputGroup
                                label="Date"
                                type="date"
                                value={form.date}
                                onChange={(e: any) => setForm({ ...form, date: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <InputGroup
                                label="Base Rate"
                                value={form.baseRate}
                                onChange={(e: any) => setForm({ ...form, baseRate: e.target.value })}
                                placeholder="₹/kg"
                            />
                            <InputGroup
                                label="Premium"
                                value={form.premium}
                                onChange={(e: any) => setForm({ ...form, premium: e.target.value })}
                                placeholder="₹/kg"
                            />
                        </div>

                        <div className="p-4 bg-slate-900 rounded-2xl text-white text-center mt-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Effective Rate</span>
                            <div className="text-2xl font-black">₹{effectiveRate.toFixed(2)}</div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Notes (Optional)</label>
                            <textarea
                                className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                                rows={2}
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                placeholder="Any context..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isAdding || !form.competitorName || effectiveRate === 0}
                            className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                        >
                            {isAdding ? "Adding..." : "Add Entry"}
                        </button>
                    </form>
                </div>

                {/* History Table */}
                <div className="lg:col-span-2 glass p-6 sm:p-8 rounded-3xl border border-white/20 h-fit">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <History className="w-4 h-4" /> Historical Trends
                    </h2>

                    <div className="overflow-x-auto -mx-6 sm:mx-0">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                    <th className="px-6 py-4">Competitor</th>
                                    <th className="px-6 py-4">Mat.</th>
                                    <th className="px-6 py-4">Base + Prem</th>
                                    <th className="px-6 py-4 text-right">Effective</th>
                                    <th className="px-6 py-4 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/50">
                                {data?.map((row: any) => (
                                    <tr key={row._id} className="group hover:bg-white/40 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900">{row.competitorName}</span>
                                                {row.notes && <span className="text-[10px] text-slate-400">{row.notes}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded",
                                                row.material === 'ALUMINIUM' ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                                            )}>{row.material === 'ALUMINIUM' ? 'Alu' : 'Cu'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-500">
                                            ₹{row.baseRate} + ₹{row.premium}
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-slate-900">
                                            ₹{row.effectiveRate.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right text-xs text-slate-400">
                                            {row.date}
                                        </td>
                                    </tr>
                                ))}
                                {!data && (
                                    <tr><td colSpan={5} className="py-12 text-center text-slate-400 animate-pulse">Loading market data...</td></tr>
                                )}
                                {data?.length === 0 && (
                                    <tr><td colSpan={5} className="py-12 text-center text-slate-400">No competitor entries yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InputGroup({ label, value, onChange, placeholder, type = "number" }: any) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pl-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
            />
        </div>
    );
}
