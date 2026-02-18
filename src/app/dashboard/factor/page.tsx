"use client";

import { useState, useEffect, useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
    calculateFactor,
    CONSTANTS
} from "@/lib/calculators/engine";
import {
    Calculator,
    Zap,
    Loader2,
    CheckCircle2,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function FactorCalculatorPage() {
    const autoSaveCalculation = useMutation(api.factorCalculations.autoSave);
    const [saveStatus, setSaveStatus] = useState<"IDLE" | "SAVING" | "SAVED" | "ERROR">("IDLE");

    const [material, setMaterial] = useState<"ALUMINIUM" | "COPPER">("ALUMINIUM");

    const [inputs, setInputs] = useState<Record<string, string | number>>({
        width: "",
        thickness: "",
        covering: "",
        percentageIncrease: "",
    });

    const [factor, setFactor] = useState<number | null>(null);

    // Parse numeric inputs for calculation
    const numInputs = useMemo(() => ({
        width: Number(inputs.width) || 0,
        thickness: Number(inputs.thickness) || 0,
        covering: Number(inputs.covering) || 0,
        percentageIncrease: Number(inputs.percentageIncrease) ?? 0,
    }), [inputs]);

    useEffect(() => {
        const { width, thickness, covering, percentageIncrease } = numInputs;
        const density = CONSTANTS.DENSITY[material];

        if (width > 0 && thickness > 0 && covering > 0 && percentageIncrease >= 0) {
            setFactor(calculateFactor({
                width,
                thickness,
                covering,
                percentageIncrease,
                density,
            }));
        } else {
            setFactor(null);
        }
    }, [numInputs, material]);

    // Answer Hash Generation
    const answerHash = useMemo(() => {
        if (factor == null || factor <= 0) return null;
        return `FACTOR|${material}|${numInputs.width}|${numInputs.thickness}|${numInputs.covering}|${numInputs.percentageIncrease}|${factor.toFixed(6)}`;
    }, [material, numInputs, factor]);

    // Auto-save Debounced Trigger
    useEffect(() => {
        if (!answerHash || factor == null || factor <= 0) return;

        setSaveStatus("SAVING");
        const timeout = setTimeout(async () => {
            try {
                await autoSaveCalculation({
                    material,
                    answerHash,
                    inputs: numInputs,
                    results: { factor },
                });
                setSaveStatus("SAVED");
                setTimeout(() => setSaveStatus("IDLE"), 3000);
            } catch (err) {
                console.error("Auto-save failed:", err);
                setSaveStatus("ERROR");
                setTimeout(() => setSaveStatus("IDLE"), 5000);
            }
        }, 1000); // 1s debounce

        return () => clearTimeout(timeout);
    }, [answerHash, material, numInputs, factor, autoSaveCalculation]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: value === "" ? "" : (parseFloat(value) || 0) }));
    };

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Factor Calculator</h1>
                <p className="text-slate-500 mt-1 text-sm sm:text-base">Reverse-engineer insulation factors</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <div className="glass p-8 rounded-3xl space-y-8">
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Material Density</label>
                        <div className="flex p-1 bg-slate-100/50 rounded-2xl border border-slate-100">
                            <button
                                onClick={() => setMaterial("ALUMINIUM")}
                                className={cn(
                                    "flex-1 py-3 rounded-xl text-sm font-bold transition-all",
                                    material === "ALUMINIUM" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                )}
                            >Aluminium ({CONSTANTS.DENSITY.ALUMINIUM})</button>
                            <button
                                onClick={() => setMaterial("COPPER")}
                                className={cn(
                                    "flex-1 py-3 rounded-xl text-sm font-bold transition-all",
                                    material === "COPPER" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                )}
                            >Copper ({CONSTANTS.DENSITY.COPPER})</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="Width (mm)" name="width" value={inputs.width} onChange={handleInputChange} />
                        <InputGroup label="Thickness (mm)" name="thickness" value={inputs.thickness} onChange={handleInputChange} />
                        <InputGroup
                            label="Covering (mm)"
                            name="covering"
                            value={inputs.covering}
                            onChange={handleInputChange}
                            step="0.01"
                            min={0}
                            max={3}
                        />
                        <InputGroup label="% Increase" name="percentageIncrease" value={inputs.percentageIncrease} onChange={handleInputChange} />
                    </div>
                </div>

                <div className="glass p-10 rounded-3xl bg-slate-900 text-white shadow-2xl flex flex-col items-center justify-center text-center space-y-8 border-none">
                    <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center rotate-3 group hover:rotate-6 transition-transform">
                        <Calculator className="w-12 h-12 text-indigo-400" />
                    </div>

                    <div className="space-y-2 w-full">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Calculated Factor</span>
                        <div className="min-h-[4.5rem] flex items-center justify-center text-7xl font-black text-white tabular-nums">
                            {factor != null && Number.isFinite(factor) && factor > 0 ? factor.toFixed(6) : "—"}
                        </div>
                    </div>

                    {/* Save Status */}
                    {factor != null && factor > 0 && (
                        <div className="w-full">
                            {saveStatus === "SAVING" && (
                                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span>Saving...</span>
                                </div>
                            )}
                            {saveStatus === "SAVED" && (
                                <div className="flex items-center justify-center gap-2 text-xs font-medium text-emerald-400 animate-in fade-in zoom-in duration-300">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Saved</span>
                                </div>
                            )}
                            {saveStatus === "ERROR" && (
                                <div className="flex items-center justify-center gap-2 text-xs font-medium text-rose-400 animate-in fade-in zoom-in duration-300">
                                    <X className="w-3 h-3" />
                                    <span>Error saving data</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="glass rounded-2xl p-4 w-full bg-white/5 border-white/10 flex items-center justify-center gap-3">
                        <Zap className="w-5 h-5 text-indigo-400" />
                        <span className="text-sm font-medium text-slate-300">Ready to use in Unified Calculator</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InputGroup({ label, name, value, onChange, step = "0.001", min, max }: {
    label: string;
    name: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    step?: string;
    min?: number;
    max?: number;
}) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pl-1">{label}</label>
            <input
                type="number"
                inputMode="decimal"
                name={name}
                value={value}
                onChange={onChange}
                step={step}
                min={min}
                max={max}
                className="w-full bg-white/40 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all font-medium"
            />
        </div>
    );
}
