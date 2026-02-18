"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { Loader2, ThumbsUp, ThumbsDown, CheckCircle2 } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
    calculateStripInsulation,
    calculateWireInsulation,
    getInsulationFactor,
    getDefaultThickness,
    CONSTANTS,
    InsulationResults,
} from "@/lib/calculators/engine";
import {
    Zap,
    Info,
    RefreshCcw,
    Save,
    ChevronDown,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";

function UnifiedCalculatorContent() {
    const searchParams = useSearchParams();
    const saveCalculation = useMutation(api.unifiedCalculations.save);
    const autoSaveCalculation = useMutation(api.unifiedCalculations.autoSave);
    const submitFeedback = useMutation(api.feedback.submitFeedback);
    const [isSaving, setIsSaving] = useState(false);
    const [latestCalculationId, setLatestCalculationId] = useState<Id<"unified_calculations"> | null>(null);
    const [feedbackStatus, setFeedbackStatus] = useState<"IDLE" | "SUBMITTING" | "DONE">("IDLE");
    const [verdict, setVerdict] = useState<"RIGHT" | "WRONG" | null>(null);
    const [saveStatus, setSaveStatus] = useState<"IDLE" | "SAVING" | "SAVED" | "ERROR">("IDLE");

    // Feature Flag
    const isFeedbackEnabled = process.env.NEXT_PUBLIC_ENABLE_AUTO_FEEDBACK === "true";

    // 0. Mode: Insulated (default) or Bare
    const [mode, setMode] = useState<"INSULATED" | "BARE">("INSULATED");

    // 1. Selector State
    const [material, setMaterial] = useState<"ALUMINIUM" | "COPPER">("ALUMINIUM");
    const [shape, setShape] = useState<"WIRE" | "STRIP">("STRIP");

    const [selectedType, setSelectedType] = useState<string>("Manual");
    const [selectedKV, setSelectedKV] = useState<string>("");

    // 2. Input State - Using string | number to allow empty fields without default '0'
    const [inputs, setInputs] = useState<Record<string, string | number>>({
        width: "",
        thickness: "",
        dia: "",
        length: 1000,
        insulationThickness: "",
        polyCov: "",
        dfgCov: "",
        factor: 1,
        finalWtReqd: 100,
        qtyPerSpool: 25,
    });

    // 3. Results State
    const [results, setResults] = useState<InsulationResults | null>(null);
    const [bareResults, setBareResults] = useState<{ bareArea: number; weight: number } | null>(null);

    const selectedTypeConfig = CONSTANTS.INSULATION_TYPES.find((t) => t.name === selectedType);
    const isDualLayerSelected = selectedTypeConfig?.isDualLayer;
    const hasKVOptions = selectedTypeConfig?.kVOptions && selectedTypeConfig.kVOptions.length > 0;

    // Initialize mode from ?mode=bare (e.g. from /dashboard/bare redirect)
    useEffect(() => {
        if (searchParams.get("mode") === "bare") {
            setMode("BARE");
        }
    }, [searchParams]);

    // Bare mode calculation
    useEffect(() => {
        if (mode !== "BARE") {
            setBareResults(null);
            return;
        }
        const density = CONSTANTS.DENSITY[material];
        const w = Number(inputs.width) || 0;
        const t = Number(inputs.thickness) || 0;
        const d = Number(inputs.dia) || 0;
        const len = Number(inputs.length) || 0;
        let area = 0;
        if (shape === "STRIP" && w > 0 && t > 0) {
            area = w * t;
        } else if (shape === "WIRE" && d > 0) {
            area = 0.785 * d * d;
        }
        if (area > 0 && len > 0) {
            const weight = (area * density * len) / 1000;
            setBareResults({ bareArea: area, weight });
        } else {
            setBareResults(null);
        }
    }, [mode, inputs, material, shape]);

    // Reset to Manual when material conflicts with material-restricted preset
    useEffect(() => {
        if (selectedType !== "Manual" && selectedTypeConfig?.materialRestriction && selectedTypeConfig.materialRestriction !== material) {
            setSelectedType("Manual");
            setSelectedKV("");
        }
    }, [material, selectedType, selectedTypeConfig?.materialRestriction]);

    // 4. Auto-calculation (Insulated mode only)
    useEffect(() => {
        if (mode === "BARE") return;
        const density = CONSTANTS.DENSITY[material];
        const type = CONSTANTS.INSULATION_TYPES.find(t => t.name === selectedType);

        // Parse inputs safely for calculation
        const numInputs = {
            width: Number(inputs.width) || 0,
            thickness: Number(inputs.thickness) || 0,
            dia: Number(inputs.dia) || 0,
            insulationThickness: Number(inputs.insulationThickness) || 0,
            polyCov: Number(inputs.polyCov) || 0,
            dfgCov: Number(inputs.dfgCov) || 0,
            factor: Number(inputs.factor) || 1,
            finalWtReqd: Number(inputs.finalWtReqd) || 0,
            qtyPerSpool: Number(inputs.qtyPerSpool) || 0,
        };

        if (isDualLayerSelected && type) {
            const totalCovering = numInputs.polyCov + numInputs.dfgCov;
            const factor = numInputs.factor;
            if (shape === "STRIP") {
                if (numInputs.width > 0 && numInputs.thickness > 0) {
                    setResults(calculateStripInsulation({
                        width: numInputs.width,
                        thickness: numInputs.thickness,
                        insulationThickness: totalCovering,
                        factor,
                        density,
                        finalWtReqd: numInputs.finalWtReqd,
                        qtyPerSpool: numInputs.qtyPerSpool,
                    }));
                }
            } else {
                if (numInputs.dia > 0) {
                    setResults(calculateWireInsulation({
                        dia: numInputs.dia,
                        insulationThickness: totalCovering,
                        factor,
                        density,
                        finalWtReqd: numInputs.finalWtReqd,
                        qtyPerSpool: numInputs.qtyPerSpool,
                    }));
                }
            }
        } else {
            if (shape === "STRIP") {
                if (numInputs.width > 0 && numInputs.thickness > 0) {
                    setResults(calculateStripInsulation({
                        ...numInputs,
                        density
                    }));
                }
            } else {
                if (numInputs.dia > 0) {
                    setResults(calculateWireInsulation({
                        ...numInputs,
                        density
                    }));
                }
            }
        }
    }, [mode, inputs, material, shape, selectedType, isDualLayerSelected]);

    // 4c. Auto-save Answer Hash Generation
    const answerHash = useMemo(() => {
        if (mode === "BARE") {
            if (!bareResults) return null;
            return `BARE|${material}|${shape}|${inputs.width}|${inputs.thickness}|${inputs.dia}|${inputs.length}|${bareResults.bareArea.toFixed(4)}|${bareResults.weight.toFixed(3)}`;
        }
        if (!results) return null;
        return `UNIFIED|${material}|${shape}|${selectedType}|${selectedKV}|${inputs.width}|${inputs.thickness}|${inputs.dia}|${inputs.insulationThickness}|${inputs.polyCov}|${inputs.dfgCov}|${inputs.factor}|${results.percentIncrease.toFixed(4)}|${results.bareWtReqd.toFixed(4)}`;
    }, [mode, material, shape, selectedType, selectedKV, inputs, results, bareResults]);

    // 4d. Auto-save Debounced Trigger
    useEffect(() => {
        if (!answerHash) return;

        setSaveStatus("SAVING");
        const timeout = setTimeout(async () => {
            try {
                const id = await autoSaveCalculation({
                    material,
                    shape,
                    mode,
                    insulationType: selectedType,
                    kV: selectedKV,
                    answerHash,
                    inputs: { ...inputs },
                    results: mode === "BARE" ? bareResults : results,
                });
                setLatestCalculationId(id);
                setSaveStatus("SAVED");
                // Reset feedback state if the answer changes
                setFeedbackStatus("IDLE");
                setVerdict(null);
                // Reset save status after 3 seconds
                setTimeout(() => setSaveStatus("IDLE"), 3000);
            } catch (err) {
                console.error("Auto-save failed:", err);
                setSaveStatus("ERROR");
                setTimeout(() => setSaveStatus("IDLE"), 5000);
            }
        }, 1000); // 1s debounce

        return () => clearTimeout(timeout);
    }, [answerHash, mode, material, shape, selectedType, selectedKV, inputs, results, bareResults, autoSaveCalculation]);

    // 4b. Auto-update preset defaults when material/shape/kV changes (Insulated only)
    useEffect(() => {
        if (mode === "BARE" || selectedType === "Manual") return;
        const type = CONSTANTS.INSULATION_TYPES.find((t) => t.name === selectedType);
        if (type) {
            const kV = hasKVOptions ? (selectedKV || type.defaultKV) : undefined;
            setInputs((prev) => ({
                ...prev,
                factor: getInsulationFactor(type, material, kV),
                insulationThickness: getDefaultThickness(type, shape),
                polyCov: type.defaultLayer1Thickness ?? "",
                dfgCov: type.defaultLayer2Thickness ?? "",
            }));
        }
    }, [mode, material, shape, selectedType, selectedKV, hasKVOptions]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInputs((prev) => ({ ...prev, [name]: value }));
        // Manual factor/thickness edit no longer resets preset; factor acts as override
    };

    const handleTypeChange = (typeName: string) => {
        setSelectedType(typeName);
        if (typeName === "Manual") {
            setSelectedKV("");
            return;
        }
        const type = CONSTANTS.INSULATION_TYPES.find((t) => t.name === typeName);
        if (type) {
            let effectiveMaterial = material;
            if (type.materialRestriction) {
                effectiveMaterial = type.materialRestriction;
                setMaterial(type.materialRestriction);
            } else if (typeName === "Cotton 42s ( mainly cu )") {
                effectiveMaterial = "COPPER";
                setMaterial("COPPER");
            } else if (typeName === "Cotton 32s ( mainly alu )") {
                effectiveMaterial = "ALUMINIUM";
                setMaterial("ALUMINIUM");
            }
            const newKV = type.kVOptions?.length ? (type.defaultKV ?? type.kVOptions[0].label) : "";
            setSelectedKV(newKV);
            setInputs((prev) => ({
                ...prev,
                factor: getInsulationFactor(type, effectiveMaterial, newKV || undefined),
                insulationThickness: getDefaultThickness(type, shape),
                polyCov: type.defaultLayer1Thickness ?? "",
                dfgCov: type.defaultLayer2Thickness ?? "",
            }));
        }
    };

    const handleKVChange = (kV: string) => {
        setSelectedKV(kV);
        if (selectedType !== "Manual") {
            const type = CONSTANTS.INSULATION_TYPES.find((t) => t.name === selectedType);
            if (type) {
                setInputs((prev) => ({
                    ...prev,
                    factor: getInsulationFactor(type, material, kV),
                }));
            }
        }
    };

    const handleFeedback = async (v: "RIGHT" | "WRONG") => {
        if (!latestCalculationId) return;
        setVerdict(v);
        setFeedbackStatus("SUBMITTING");
        try {
            await submitFeedback({
                calculationId: latestCalculationId,
                verdict: v,
                inputsSnapshot: { ...inputs },
                selectionSnapshot: { material, shape, mode, selectedType, selectedKV },
                resultsSnapshot: mode === "BARE" ? { ...bareResults } : { ...results },
            });
            setFeedbackStatus("DONE");
        } catch (err) {
            console.error("Feedback submission failed:", err);
            setFeedbackStatus("IDLE");
            setVerdict(null);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus("SAVING");
        try {
            if (mode === "BARE" && bareResults) {
                await saveCalculation({
                    material,
                    shape,
                    mode,
                    insulationType: "Bare",
                    answerHash: answerHash || undefined,
                    inputs: {
                        width: Number(inputs.width) || 0,
                        thickness: Number(inputs.thickness) || 0,
                        dia: Number(inputs.dia) || 0,
                        length: Number(inputs.length) || 0,
                        insulation: "Bare",
                    },
                    results: bareResults
                });
                setSaveStatus("SAVED");
                setTimeout(() => setSaveStatus("IDLE"), 3000);
                alert("Calculation saved successfully!");
            } else if (results) {
                await saveCalculation({
                    material,
                    shape,
                    mode,
                    insulationType: selectedType,
                    kV: selectedKV,
                    answerHash: answerHash || undefined,
                    inputs: {
                        width: Number(inputs.width) || 0,
                        thickness: Number(inputs.thickness) || 0,
                        dia: Number(inputs.dia) || 0,
                        insulationThickness: Number(inputs.insulationThickness) || 0,
                        polyCov: Number(inputs.polyCov) || 0,
                        dfgCov: Number(inputs.dfgCov) || 0,
                        factor: Number(inputs.factor) || 0,
                        finalWtReqd: Number(inputs.finalWtReqd) || 0,
                        qtyPerSpool: Number(inputs.qtyPerSpool) || 0,
                        insulationType: selectedType,
                        ...(selectedKV && { kV: selectedKV }),
                    },
                    results
                });
                setSaveStatus("SAVED");
                setTimeout(() => setSaveStatus("IDLE"), 3000);
                alert("Calculation saved successfully!");
            }
        } catch (err) {
            console.error(err);
            setSaveStatus("ERROR");
            setTimeout(() => setSaveStatus("IDLE"), 5000);
            alert("Failed to save calculation.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Unified Calculator</h1>
                    <p className="text-slate-500 mt-1 text-sm sm:text-base">Multi-material insulation & weight planning</p>
                </div>
                <div className="flex gap-2 sm:gap-3">
                    <button
                        onClick={() => setInputs({
                            width: "",
                            thickness: "",
                            dia: "",
                            length: 1000,
                            insulationThickness: "",
                            polyCov: "",
                            dfgCov: "",
                            factor: 1,
                            finalWtReqd: 100,
                            qtyPerSpool: 25,
                        })}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white/50 hover:bg-white text-slate-600 rounded-xl border border-white/20 transition-all text-xs sm:text-sm font-medium"
                    >
                        <RefreshCcw className="w-4 h-4" /> Reset
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || (mode === "BARE" ? !bareResults : !results)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-slate-900 text-white rounded-xl shadow-lg hover:shadow-xl transition-all text-xs sm:text-sm font-medium disabled:opacity-50"
                    >
                        {isSaving ? "Saving..." : <><Save className="w-4 h-4" /> Save</>}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Input Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass p-5 sm:p-8 rounded-3xl space-y-6 sm:space-y-8">
                        {/* Mode Toggle */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Mode</label>
                            <div className="flex p-1 bg-slate-100/50 rounded-2xl border border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setMode("INSULATED")}
                                    className={cn(
                                        "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
                                        mode === "INSULATED" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >Insulated</button>
                                <button
                                    type="button"
                                    onClick={() => setMode("BARE")}
                                    className={cn(
                                        "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
                                        mode === "BARE" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >Bare</button>
                            </div>
                        </div>

                        {/* Primary Selectors */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                        {/* Insulation Selector (Insulated mode only) */}
                        {mode === "INSULATED" && (
                        <div className="space-y-3 pt-4 border-t border-slate-100/50">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Insulation Preset</label>
                            </div>
                            <div className="relative">
                                <select
                                    value={selectedType}
                                    onChange={(e) => handleTypeChange(e.target.value)}
                                    className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl pl-4 pr-10 py-3 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all font-bold appearance-none cursor-pointer truncate"
                                >
                                    <option value="Manual">Manual Entry (Custom Factor)</option>
                                    {CONSTANTS.INSULATION_TYPES.filter(
                                        (t) => !t.materialRestriction || t.materialRestriction === material
                                    ).map((type) => (
                                        <option key={type.name} value={type.name}>{type.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                            </div>
                            {hasKVOptions && selectedTypeConfig?.kVOptions && (
                                <div className="flex gap-2 mt-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 self-center">Voltage</label>
                                    <div className="flex p-1 bg-slate-100/50 rounded-xl border border-slate-100">
                                        {selectedTypeConfig.kVOptions.map((opt) => (
                                            <button
                                                key={opt.label}
                                                type="button"
                                                onClick={() => handleKVChange(opt.label)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                                    (selectedKV || selectedTypeConfig.defaultKV) === opt.label
                                                        ? "bg-white text-slate-900 shadow-sm"
                                                        : "text-slate-500 hover:text-slate-700"
                                                )}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        )}

                        {/* Input Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 pt-4 sm:pt-6 border-t border-slate-100/50">
                            {mode === "BARE" ? (
                                <>
                                    {shape === "STRIP" ? (
                                        <>
                                            <InputGroup label="Width (mm)" name="width" value={inputs.width} onChange={handleInputChange} />
                                            <InputGroup label="Thickness (mm)" name="thickness" value={inputs.thickness} onChange={handleInputChange} />
                                        </>
                                    ) : (
                                        <InputGroup label="Diameter (mm)" name="dia" value={inputs.dia} onChange={handleInputChange} />
                                    )}
                                    <div className={shape === "STRIP" ? "col-span-2" : ""}>
                                        <InputGroup label="Length (m)" name="length" value={inputs.length} onChange={handleInputChange} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    {shape === "STRIP" ? (
                                        <>
                                            <InputGroup label="Width (mm)" name="width" value={inputs.width} onChange={handleInputChange} />
                                            <InputGroup label="Thickness (mm)" name="thickness" value={inputs.thickness} onChange={handleInputChange} />
                                        </>
                                    ) : (
                                        <InputGroup label="Diameter (mm)" name="dia" value={inputs.dia} onChange={handleInputChange} />
                                    )}

                                    {isDualLayerSelected ? (
                                <>
                                    <InputGroup
                                        label={`${selectedTypeConfig?.layer1Name ?? "Layer 1"} (mm)`}
                                        name="polyCov"
                                        value={inputs.polyCov}
                                        onChange={handleInputChange}
                                        highlight
                                    />
                                    <InputGroup
                                        label={`${selectedTypeConfig?.layer2Name ?? "Layer 2"} (mm)`}
                                        name="dfgCov"
                                        value={inputs.dfgCov}
                                        onChange={handleInputChange}
                                        highlight
                                    />
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pl-1">Total Insulation (mm)</label>
                                        <div className="w-full bg-indigo-50/70 border border-indigo-200 rounded-xl px-4 py-3 text-slate-900 font-medium text-center">
                                            {(Number(inputs.polyCov) || 0) + (Number(inputs.dfgCov) || 0)}
                                        </div>
                                    </div>
                                    <InputGroup
                                        label="Insulation Factor"
                                        name="factor"
                                        value={inputs.factor}
                                        onChange={handleInputChange}
                                        highlight={selectedType !== "Manual"}
                                    />
                                </>
                            ) : (
                                <>
                                    <InputGroup
                                        label="Insulation Thk (mm)"
                                        name="insulationThickness"
                                        value={inputs.insulationThickness}
                                        onChange={handleInputChange}
                                        highlight={selectedType !== "Manual"}
                                    />
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pl-1">Total Insulation (mm)</label>
                                        <div className="w-full bg-indigo-50/70 border border-indigo-200 rounded-xl px-4 py-3 text-slate-900 font-medium text-center">
                                            {Number(inputs.insulationThickness) || 0}
                                        </div>
                                    </div>
                                    <InputGroup
                                        label="Insulation Factor"
                                        name="factor"
                                        value={inputs.factor}
                                        onChange={handleInputChange}
                                        highlight={selectedType !== "Manual"}
                                    />
                                </>
                            )}
                                    <InputGroup label="Total Weight (kg)" name="finalWtReqd" value={inputs.finalWtReqd} onChange={handleInputChange} />
                                    <InputGroup label="Qty/Spool (kg)" name="qtyPerSpool" value={inputs.qtyPerSpool} onChange={handleInputChange} />
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Results Column */}
                <div className="space-y-6">
                    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Zap className="w-24 h-24" />
                        </div>

                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">
                            {mode === "BARE" ? "Bare Analysis" : "Live Calculations"}
                        </h2>

                        <div className="space-y-5 relative z-10">
                            {mode === "BARE" ? (
                                <>
                                    <ResultRow label="Bare Area" value={bareResults?.bareArea.toFixed(4) || "—"} unit="mm²" />
                                    <ResultRow label="Weight" value={bareResults?.weight.toFixed(3) || "—"} unit="kg" highlight />
                                    <div className="pt-4 border-t border-white/10 text-xs text-slate-400">
                                        Density: {CONSTANTS.DENSITY[material]} kg/dm³
                                    </div>
                                </>
                            ) : (
                                <>
                            <ResultRow label="Bare Area" value={results?.bareArea.toFixed(4) || "—"} unit="mm²" />
                            <ResultRow label="Insulated Area" value={results?.insulatedArea.toFixed(4) || "—"} unit="mm²" />

                            {results?.dualLayer ? (
                                <div className="space-y-4 py-4 border-y border-white/10">
                                    <ResultRow label="Poly % Increase" value={results.dualLayer.polyPercent.toFixed(2)} unit="%" />
                                    <ResultRow label="DFG % Increase" value={results.dualLayer.dfgPercent.toFixed(2)} unit="%" />
                                    <ResultRow label="Total % Increase" value={results.percentIncrease.toFixed(2)} unit="%" highlight />
                                    <ResultRow label="Wt after Poly" value={results.dualLayer.weightAfterPoly.toFixed(2)} unit="kg" />
                                </div>
                            ) : (
                                <div className="py-4 border-y border-white/10">
                                    <ResultRow label="% Weight Increase" value={results?.percentIncrease.toFixed(2) || "0.00"} unit="%" highlight />
                                </div>
                            )}

                            <ResultRow label="Bare Wt Reqd" value={results?.bareWtReqd.toFixed(2) || "—"} unit="kg" />
                            <ResultRow label="Meters/Spool" value={results?.metersPerSpool.toFixed(0) || "—"} unit="m" />
                            <ResultRow label="Production" value={results?.productionKgHr.toFixed(2) || "—"} unit="kg/hr" />

                            <div className="pt-5 mt-4 border-t border-white/10">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Production Time</span>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-3xl font-bold text-indigo-400">{results?.totalHoursReqd.toFixed(2) || "0.00"}</span>
                                    <span className="text-sm font-bold text-slate-400">hours</span>
                                </div>
                            </div>
                                </>
                            )}
                        </div>

                        {/* Save Status */}
                        {(mode === "BARE" ? bareResults : results) && (
                            <div className="mt-6 pt-6 border-t border-white/10">
                                {saveStatus === "SAVING" && (
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        <span>Saving...</span>
                                    </div>
                                )}
                                {saveStatus === "SAVED" && (
                                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 animate-in fade-in zoom-in duration-300">
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span>Saved</span>
                                    </div>
                                )}
                                {saveStatus === "ERROR" && (
                                    <div className="flex items-center gap-2 text-xs font-medium text-rose-400 animate-in fade-in zoom-in duration-300">
                                        <X className="w-3 h-3" />
                                        <span>Error saving data</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Feedback Area */}
                        {isFeedbackEnabled && latestCalculationId && (
                            <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Is this result correct?</span>
                                    {feedbackStatus === "DONE" && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 animate-in fade-in zoom-in duration-300">
                                            <CheckCircle2 className="w-3 h-3" /> Received
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleFeedback("RIGHT")}
                                        disabled={feedbackStatus !== "IDLE"}
                                        className={cn(
                                            "flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all text-xs font-bold",
                                            feedbackStatus === "DONE" && verdict === "RIGHT" 
                                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                                                : feedbackStatus === "DONE"
                                                ? "opacity-30 border-white/10 text-white/50 grayscale"
                                                : "bg-white/5 border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/50 text-white"
                                        )}
                                    >
                                        <ThumbsUp className="w-4 h-4" /> Right
                                    </button>
                                    <button
                                        onClick={() => handleFeedback("WRONG")}
                                        disabled={feedbackStatus !== "IDLE"}
                                        className={cn(
                                            "flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all text-xs font-bold",
                                            feedbackStatus === "DONE" && verdict === "WRONG"
                                                ? "bg-rose-500/20 border-rose-500 text-rose-400"
                                                : feedbackStatus === "DONE"
                                                ? "opacity-30 border-white/10 text-white/50 grayscale"
                                                : "bg-white/5 border-white/10 hover:bg-rose-500/10 hover:border-rose-500/50 text-white"
                                        )}
                                    >
                                        <ThumbsDown className="w-4 h-4" /> Wrong
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="glass p-6 rounded-2xl bg-indigo-50/50 border-indigo-100">
                        <div className="flex gap-3">
                            <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                            <div className="text-xs text-indigo-700 leading-relaxed">
                                {mode === "BARE" ? (
                                    <>Bare weight = area × density × length / 1000. Density: <strong>{material}</strong> ({CONSTANTS.DENSITY[material]} kg/dm³).</>
                                ) : (
                                    <>Calculations based on <strong>{material}</strong> density ({CONSTANTS.DENSITY[material]} kg/dm³). Production assumes default speed of {CONSTANTS.PRODUCTION.DEFAULT_SPEED_M_HR} m/hr.</>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InputGroup({ label, name, value, onChange, highlight }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pl-1">{label}</label>
            <input
                type="number"
                name={name}
                value={value}
                onChange={onChange}
                step="0.01"
                className={cn(
                    "w-full bg-white/40 border rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300 font-medium",
                    highlight ? "border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500" : "border-slate-200"
                )}
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

export default function UnifiedCalculatorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        }>
            <UnifiedCalculatorContent />
        </Suspense>
    );
}
