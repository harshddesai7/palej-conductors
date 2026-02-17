"use client";

import { useState } from "react";
import {
    Activity,
    Calculator,
    Zap,
    Layers,
    Clock,
    Timer,
    ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DieCalculatorPage() {
    const [inputs, setInputs] = useState({
        dia: 0,
        temp: 450,
        speed: 8,
    });

    const dieTime = inputs.dia > 0 ? (inputs.dia * 1.25).toFixed(2) : "0.00";

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Aluminium Die Calculator</h1>
                    <p className="text-slate-500 mt-1 text-sm sm:text-base">Tooling performance & thermal analysis</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <div className="glass p-8 rounded-3xl space-y-8">
                    <div className="grid grid-cols-1 gap-6">
                        <InputGroup
                            label="Aluminium Diameter (mm)"
                            value={inputs.dia}
                            onChange={(e: any) => setInputs({ ...inputs, dia: parseFloat(e.target.value) || 0 })}
                        />
                        <InputGroup
                            label="Target Temperature (°C)"
                            value={inputs.temp}
                            onChange={(e: any) => setInputs({ ...inputs, temp: parseFloat(e.target.value) || 0 })}
                        />
                        <InputGroup
                            label="Inlet Speed (m/min)"
                            value={inputs.speed}
                            onChange={(e: any) => setInputs({ ...inputs, speed: parseFloat(e.target.value) || 0 })}
                        />
                    </div>

                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Thermal Calibration</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Cooling Constant</span>
                                <span className="font-bold text-slate-900">1.25 κ</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Friction Factor</span>
                                <span className="font-bold text-slate-900">0.08 μ</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass p-10 rounded-3xl flex flex-col items-center justify-center text-center space-y-8 bg-slate-900 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Timer className="w-32 h-32" />
                    </div>

                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                        <Clock className="w-10 h-10 text-indigo-400" />
                    </div>

                    <div className="space-y-2 relative z-10">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recommended Die Time</span>
                        <div className="text-7xl font-black">{dieTime} <span className="text-2xl text-slate-500 font-medium tracking-tight">sec</span></div>
                    </div>

                    <button className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-900/20 flex items-center justify-center gap-3 group relative z-10">
                        Optimize Thermal Profile <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function InputGroup({ label, value, onChange }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pl-1">{label}</label>
            <input
                type="number"
                value={value}
                onChange={onChange}
                className="w-full bg-white/50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-bold text-xl"
            />
        </div>
    );
}
