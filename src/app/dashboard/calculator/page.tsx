"use client";

import { useState, useEffect } from "react";
import {
    calculateStripInsulation,
    calculateWireInsulation,
    CONSTANTS,
    InsulationResults
} from "@/lib/calculators/engine";
import {
    Zap,
    ArrowRight,
    Info,
    RefreshCcw,
    Save
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function UnifiedCalculatorPage() {
    // 1. Selector State
    const [material, setMaterial] = useState<"ALUMINIUM" | "COPPER">("ALUMINIUM");
    const [shape, setShape] = useState<"WIRE" | "STRIP">("STRIP");

    // 2. Input State
    const [inputs, setInputs] = useState({
        width: 0,
        thickness: 0,
        dia: 0,
        insulationThickness: 0,
        factor: 1,
        finalWtReqd: 100,
        qtyPerSpool: 25,
    });

    // 3. Results State
    const [results, setResults] = useState<InsulationResults | null>(null);

    // 4. Auto-calculation
    useEffect(() => {
        const density = CONSTANTS.DENSITY[material];

        if (shape === "STRIP") {
            if (inputs.width > 0 && inputs.thickness > 0) {
                setResults(calculateStripInsulation({
                    ...inputs,
                    density
                }));
            }
        } else {
            if (inputs.dia > 0) {
                setResults(calculateWireInsulation({
                    ...inputs,
                    density
                }));
            }
        }
    }, [inputs, material, shape]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Area */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Unified Calculator</h1>
                    <p className="text-slate-500 mt-1">Multi-material insulation & weight planning</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/50 hover:bg-white text-slate-600 rounded-xl border border-white/20 transition-all text-sm font-medium">
                        <RefreshCcw className="w-4 h-4" /> Reset
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl shadow-lg hover:shadow-xl transition-all text-sm font-medium">
                        <Save className="w-4 h-4" /> Save Result
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Input Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass p-8 rounded-3xl space-y-8">
                        {/* Primary Selectors */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Material</label>
                                <div className="flex p-1 bg-slate-100/50 rounded-2xl border border-slate-100">
                                    <button
                                        onClick={() => setMaterial("ALUMINIUM")}
                                        className={cn(
                                            "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
                                            material === "ALUMINIUM" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                        )}
                                    >Aluminium</button>
                                    <button
                                        onClick={() => setMaterial("COPPER")}
                                        className={cn(
                                            "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
                                            material === "COPPER" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                        )}
                                    >Copper</button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Shape</label>
                                <div className="flex p-1 bg-slate-100/50 rounded-2xl border border-slate-100">
                                    <button
                                        onClick={() => setShape("STRIP")}
                                        className={cn(
                                            "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
                                            shape === "STRIP" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                        )}
                                    >Strip</button>
                                    <button
                                        onClick={() => setShape("WIRE")}
                                        className={cn(
                                            "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
                                            shape === "WIRE" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                        )}
                                    >Wire</button>
                                </div>
                            </div>
                        </div>

                        {/* Dimensional Inputs */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-slate-100/50">
                            {shape === "STRIP" ? (
                                <>
                                    <InputGroup label="Width (mm)" name="width" value={inputs.width} onChange={handleInputChange} placeholder="e.g. 10.0" />
                                    <InputGroup label="Thickness (mm)" name="thickness" value={inputs.thickness} onChange={handleInputChange} placeholder="e.g. 1.5" />
                                </>
                            ) : (
                                <InputGroup label="Diameter (mm)" name="dia" value={inputs.dia} onChange={handleInputChange} placeholder="e.g. 2.5" />
                            )}
                            <InputGroup label="Insulation Thk (mm)" name="insulationThickness" value={inputs.insulationThickness} onChange={handleInputChange} placeholder="e.g. 0.05" />
                            <InputGroup label="Insulation Factor" name="factor" value={inputs.factor} onChange={handleInputChange} placeholder="1.0" />
                            <InputGroup label="Total Weight (kg)" name="finalWtReqd" value={inputs.finalWtReqd} onChange={handleInputChange} placeholder="100" />
                            <InputGroup label="Qty/Spool (kg)" name="qtyPerSpool" value={inputs.qtyPerSpool} onChange={handleInputChange} placeholder="25" />
                        </div>
                    </div>
                </div>

                {/* Results Column */}
                <div className="space-y-6">
                    <div className="glass p-8 rounded-3xl bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Zap className="w-24 h-24" />
                        </div>

                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Live Calculations</h2>

                        <div className="space-y-6 relative z-10">
                            <ResultRow label="Bare Area" value={results?.bareArea.toFixed(4) || "0.0000"} unit="mm²" />
                            <ResultRow label="Insulated Area" value={results?.insulatedArea.toFixed(4) || "0.0000"} unit="mm²" />
                            <div className="py-4 border-y border-white/10">
                                <ResultRow label="% Weight Increase" value={results?.percentIncrease.toFixed(2) || "0.00"} unit="%" highlight />
                            </div>
                            <ResultRow label="Bare Wt Reqd" value={results?.bareWtReqd.toFixed(2) || "0.00"} unit="kg" />
                            <ResultRow label="Meters/Spool" value={results?.metersPerSpool.toFixed(0) || "0"} unit="m" />
                            <ResultRow label="Production" value={results?.productionKgHr.toFixed(2) || "0.00"} unit="kg/hr" />

                            <div className="pt-6 mt-4 border-t border-white/10 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">Total Production Time</span>
                                    <span className="text-2xl font-bold">{results?.totalHoursReqd.toFixed(2) || "0.00"} hrs</span>
                                </div>
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                    <ArrowRight className="w-6 h-6 text-indigo-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass p-6 rounded-2xl bg-indigo-50/50 border-indigo-100">
                        <div className="flex gap-3">
                            <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                            <div className="text-xs text-indigo-700 leading-relaxed">
                                Calculations based on <strong>{material}</strong> density ({CONSTANTS.DENSITY[material]} kg/dm³).
                                Production assumes default speed of {CONSTANTS.PRODUCTION.DEFAULT_SPEED_M_HR} m/hr.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InputGroup({ label, name, value, onChange, placeholder }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pl-1">{label}</label>
            <input
                type="number"
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                step="0.01"
                className="w-full bg-white/40 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300 font-medium"
            />
        </div>
    );
}

function ResultRow({ label, value, unit, highlight }: any) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">{label}</span>
            <div className="flex items-baseline gap-1">
                <span className={cn(
                    "text-xl font-bold",
                    highlight ? "text-indigo-400" : "text-white"
                )}>{value}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">{unit}</span>
            </div>
        </div>
    );
}
