"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
    CONSTANTS,
    getDefaultThickness,
    InsulationType
} from "@/lib/calculators/engine";
import {
    Box,
    ArrowRight,
    Settings2,
    Save
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function BareCalculatorPage() {
    const saveCalculation = useMutation(api.calculations.save);
    const [isSaving, setIsSaving] = useState(false);

    const [material, setMaterial] = useState<"ALUMINIUM" | "COPPER">("ALUMINIUM");
    const [shape, setShape] = useState<"WIRE" | "STRIP">("STRIP");
    const [insulation, setInsulation] = useState<string>("Bare");

    const [inputs, setInputs] = useState({
        width: 0,
        thickness: 0,
        dia: 0,
        length: 1000, // Default 1000m
    });

    const [bareArea, setBareArea] = useState(0);
    const [weight, setWeight] = useState(0);

    useEffect(() => {
        const density = CONSTANTS.DENSITY[material];
        let area = 0;

        if (shape === "STRIP") {
            area = inputs.width * inputs.thickness;
        } else {
            area = 0.785 * inputs.dia * inputs.dia;
        }

        setBareArea(area);
        setWeight((area * density * inputs.length) / 1000); // weight in kg
    }, [inputs, material, shape]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveCalculation({
                type: "Bare",
                material,
                shape,
                inputs: { ...inputs, insulation },
                results: { bareArea, weight }
            });
            alert("Calculation saved!");
        } catch (err) {
            console.error(err);
            alert("Save failed.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Bare Calculator</h1>
                    <p className="text-slate-500 mt-1 text-sm sm:text-base">Basic dimensional & weight analysis</p>
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
                    <div className="flex gap-4">
                        <button
                            onClick={() => setMaterial("ALUMINIUM")}
                            className={cn(
                                "flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all border",
                                material === "ALUMINIUM" ? "bg-slate-900 text-white border-slate-900" : "bg-white/50 text-slate-500 border-slate-200"
                            )}
                        >Aluminium</button>
                        <button
                            onClick={() => setMaterial("COPPER")}
                            className={cn(
                                "flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all border",
                                material === "COPPER" ? "bg-slate-900 text-white border-slate-900" : "bg-white/50 text-slate-500 border-slate-200"
                            )}
                        >Copper</button>
                    </div>

                    <div className="flex gap-4 p-1 bg-slate-100/50 rounded-2xl">
                        <button
                            onClick={() => setShape("STRIP")}
                            className={cn(
                                "flex-1 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all",
                                shape === "STRIP" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
                            )}
                        >Strip</button>
                        <button
                            onClick={() => setShape("WIRE")}
                            className={cn(
                                "flex-1 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all",
                                shape === "WIRE" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
                            )}
                        >Wire</button>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1">Target Insulation</label>
                            {insulation === "Cotton 42s ( cu )" && (
                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                    ⚠️ Unverified
                                </span>
                            )}
                        </div>
                        <select
                            value={insulation}
                            onChange={(e) => setInsulation(e.target.value)}
                            className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all font-bold appearance-none cursor-pointer"
                        >
                            <option value="Bare">None (Bare Only)</option>
                            {CONSTANTS.INSULATION_TYPES.map(type => (
                                <option key={type.name} value={type.name}>{type.name}</option>
                            ))}
                        </select>
                        {insulation !== "Bare" && (
                            <div className="mt-2 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase text-indigo-400">Projected Covered Dim</span>
                                <span className="text-xs font-bold text-indigo-700">
                                    {(() => {
                                        const type = CONSTANTS.INSULATION_TYPES.find(t => t.name === insulation);
                                        const thk = type ? getDefaultThickness(type, shape) : 0;
                                        if (shape === "STRIP") {
                                            return `${(inputs.width + thk).toFixed(2)} x ${(inputs.thickness + thk).toFixed(2)} mm`;
                                        }
                                        return `${(inputs.dia + thk).toFixed(2)} mm (dia)`;
                                    })()}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {shape === "STRIP" ? (
                            <>
                                <InputGroup label="Width (mm)" name="width" value={inputs.width} onChange={handleInputChange} />
                                <InputGroup label="Thickness (mm)" name="thickness" value={inputs.thickness} onChange={handleInputChange} />
                            </>
                        ) : (
                            <InputGroup label="Diameter (mm)" name="dia" value={inputs.dia} onChange={handleInputChange} />
                        )}
                        <div className="col-span-2">
                            <InputGroup label="Length (Meters)" name="length" value={inputs.length} onChange={handleInputChange} />
                        </div>
                    </div>
                </div>

                <div className="glass p-10 rounded-3xl flex flex-col items-center justify-center text-center space-y-6 border-slate-200/50">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-2">
                        <Box className="w-10 h-10 text-indigo-600" />
                    </div>

                    <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bare Area</span>
                        <div className="text-5xl font-black text-slate-900 mt-1">{bareArea.toFixed(4)} <span className="text-lg text-slate-400 font-medium">mm²</span></div>
                    </div>

                    <div className="w-full h-px bg-slate-100" />

                    <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Calculated Weight</span>
                        <div className="text-6xl font-black text-indigo-600 mt-1">{weight.toFixed(3)} <span className="text-xl text-slate-400 font-medium">kg</span></div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Settings2 className="w-4 h-4" />
                        <span>Density: {CONSTANTS.DENSITY[material]} kg/dm³</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InputGroup({ label, name, value, onChange }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pl-1">{label}</label>
            <input
                type="number"
                name={name}
                value={value}
                onChange={onChange}
                className="w-full bg-white/50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all font-bold text-lg"
            />
        </div>
    );
}
