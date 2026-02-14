"use client";

import { useState, useEffect } from "react";
import {
    calculateLMECopper
} from "@/lib/calculators/engine";
import {
    TrendingDown,
    ArrowRight,
    ExternalLink,
    Save
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LMECopperPage() {
    const [lme, setLme] = useState(0);
    const [sbiRate, setSbiRate] = useState(0);

    const [results, setResults] = useState({
        lmePlusPremium: 0,
        cspRate: 0,
        wwmaiRate: 0,
    });

    useEffect(() => {
        if (lme > 0 && sbiRate > 0) {
            setResults(calculateLMECopper({ lme, sbiRate }));
        }
    }, [lme, sbiRate]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">LME Copper Pricing</h1>
                    <p className="text-slate-500 mt-1">International metal index rates & localized pricing</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl shadow-lg transition-all text-sm font-medium">
                    <Save className="w-4 h-4" /> Save Pricing
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass p-8 rounded-3xl space-y-8 h-fit">
                    <div className="space-y-6">
                        <InputGroup
                            label="LME Price (USD)"
                            value={lme}
                            onChange={(e: any) => setLme(parseFloat(e.target.value) || 0)}
                            placeholder="e.g. 9500"
                            icon={<TrendingDown className="w-5 h-5 text-slate-400" />}
                        />

                        <InputGroup
                            label="SBI TT sell rate (10-20 lac)"
                            value={sbiRate}
                            onChange={(e: any) => setSbiRate(parseFloat(e.target.value) || 0)}
                            placeholder="e.g. 83.5"
                            icon={<ExternalLink className="w-5 h-5 text-slate-400" />}
                        />
                    </div>

                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Market Context</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">LME Premium</span>
                                <span className="font-bold text-slate-900">$190.00</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Handling Charges</span>
                                <span className="font-bold text-slate-900">₹4,250.00</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass p-8 rounded-3xl space-y-8 h-full">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Calculated Rates</h2>

                        <div className="grid grid-cols-1 gap-6">
                            <PriceCard
                                label="LME + Premium"
                                value={results.lmePlusPremium.toFixed(2)}
                                unit="USD"
                                color="text-slate-900"
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-100 space-y-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">CSP Rate</span>
                                    <div className="text-3xl font-black">₹{results.cspRate.toFixed(2)}</div>
                                    <div className="text-[10px] opacity-70">Multiplier: 1.055</div>
                                </div>

                                <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-xl shadow-slate-100 space-y-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">WWMAI Rate</span>
                                    <div className="text-3xl font-black">₹{results.wwmaiRate.toFixed(2)}</div>
                                    <div className="text-[10px] opacity-70">Multiplier: 1.106</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-100 rounded-xl flex gap-3">
                            <div className="w-1 h-full bg-yellow-400 rounded-full" />
                            <p className="text-[11px] text-yellow-800 leading-relaxed font-medium">
                                These rates are indicative. Final pricing should be verified with the accounts department before commitment.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InputGroup({ label, value, onChange, placeholder, icon }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pl-1">{label}</label>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    {icon}
                </div>
                <input
                    type="number"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full bg-white/40 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all font-bold text-xl"
                />
            </div>
        </div>
    );
}

function PriceCard({ label, value, unit, color }: any) {
    return (
        <div className="p-6 bg-white/30 border border-white/40 rounded-3xl flex justify-between items-center">
            <span className="text-sm font-bold text-slate-500">{label}</span>
            <div className="flex items-baseline gap-2">
                <span className={cn("text-4xl font-black", color)}>{value}</span>
                <span className="text-xs font-bold text-slate-400">{unit}</span>
            </div>
        </div>
    );
}
