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
    ArrowRight,
    Zap,
    Save,
    Loader2,
    CheckCircle2,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function FactorCalculatorPage() {
    const saveCalculation = useMutation(api.factorCalculations.save);
    const autoSaveCalculation = useMutation(api.factorCalculations.autoSave);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"IDLE" | "SAVING" | "SAVED" | "ERROR">("IDLE");

    const [material, setMaterial] = useState<"ALUMINIUM" | "COPPER">("ALUMINIUM");

    const [inputs, setInputs] = useState({
        width: 0,
        thickness: 0,
        covering: 0,
        percentageIncrease: 0,
    });

    const [factor, setFactor] = useState(0);

    useEffect(() => {
        const density = CONSTANTS.DENSITY[material];

        if (inputs.width > 0 && inputs.thickness > 0 && inputs.covering > 0 && inputs.percentageIncrease > 0) {
            setFactor(calculateFactor({
                ...inputs,
                density
            }));
        } else {
            setFactor(0);
        }
    }, [inputs, material]);

    // Answer Hash Generation
    const answerHash = useMemo(() => {
        if (factor <= 0) return null;
        return `FACTOR|${material}|${inputs.width}|${inputs.thickness}|${inputs.covering}|${inputs.percentageIncrease}|${factor.toFixed(6)}`;
    }, [material, inputs, factor]);

    // Auto-save Debounced Trigger
    useEffect(() => {
        if (!answerHash || factor <= 0) return;

        setSaveStatus("SAVING");
        const timeout = setTimeout(async () => {
            try {
                await autoSaveCalculation({
                    material,
                    answerHash,
                    inputs: { ...inputs },
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
    }, [answerHash, material, inputs, factor, autoSaveCalculation]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus("SAVING");
        try {
            await saveCalculation({
                material,
                answerHash: answerHash || undefined,
                inputs,
                results: { factor }
            });
            setSaveStatus("SAVED");
            setTimeout(() => setSaveStatus("IDLE"), 3000);
            alert("Factor saved!");
        } catch (err) {
            console.error(err);
            setSaveStatus("ERROR");
            setTimeout(() => setSaveStatus("IDLE"), 5000);
            alert("Save failed.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Factor Calculator</h1>
                    <p className="text-slate-500 mt-1 text-sm sm:text-base">Reverse-engineer insulation factors</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl shadow-lg transition-all text-sm font-medium w-full sm:w-auto disabled:opacity-50"
                >
                    {isSaving ? "Saving..." : <><Save className="w-4 h-4" /> Save</>}
                </button>
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
                            placeholder="0.10 - 2.2"
                        />
                        <InputGroup label="% Increase" name="percentageIncrease" value={inputs.percentageIncrease} onChange={handleInputChange} />
                    </div>
                </div>

                <div className="glass p-10 rounded-3xl bg-slate-900 text-white shadow-2xl flex flex-col items-center justify-center text-center space-y-8 border-none">
                    <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center rotate-3 group hover:rotate-6 transition-transform">
                        <Calculator className="w-12 h-12 text-indigo-400" />
                    </div>

                    <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Calculated Factor</span>
                        <div className="text-7xl font-black text-white">{factor > 0 ? factor.toFixed(6) : "—"}</div>
                    </div>

                    {/* Save Status */}
                    {factor > 0 && (
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

function InputGroup({ label, name, value, onChange, step = "0.001", min, max, placeholder }: {
    label: string;
    name: string;
    value: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    step?: string;
    min?: number;
    max?: number;
    placeholder?: string;
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
                placeholder={placeholder}
                className="w-full bg-white/40 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all font-medium"
            />
        </div>
    );
}
