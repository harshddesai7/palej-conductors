"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
    Plus,
    Play,
    CheckCircle2,
    Clock,
    Ruler,
    Scale
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function InstructionsPage() {
    const data = useQuery(api.instructions.list);
    const createInstruction = useMutation(api.instructions.create);
    const updateStatus = useMutation(api.instructions.updateStatus);

    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState({
        orderNumber: "",
        customer: "",
        size: "",
        material: "ALUMINIUM",
        insulationType: "DFG",
        targetWeight: 0,
        speedMhr: 256,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            await createInstruction({
                ...form,
                targetWeight: Number(form.targetWeight),
                speedMhr: Number(form.speedMhr),
                status: "PENDING"
            });
            setForm({
                orderNumber: "",
                customer: "",
                size: "",
                material: "ALUMINIUM",
                insulationType: "DFG",
                targetWeight: 0,
                speedMhr: 256,
            });
            alert("Work Instruction Issued!");
        } catch (err) {
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Work Instructions</h1>
                <p className="text-slate-500 mt-1 text-sm sm:text-base">Production floor guidance & order tracking</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
                {/* Entry Form */}
                <div className="lg:col-span-1 glass p-6 rounded-3xl h-fit border border-white/20">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Issue Order
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <InputGroup
                            label="Order #"
                            value={form.orderNumber}
                            onChange={(e: any) => setForm({ ...form, orderNumber: e.target.value })}
                            placeholder="e.g. PC/24/001"
                            type="text"
                        />
                        <InputGroup
                            label="Customer"
                            value={form.customer}
                            onChange={(e: any) => setForm({ ...form, customer: e.target.value })}
                            placeholder="e.g. ABB India"
                            type="text"
                        />
                        <InputGroup
                            label="Size (mm)"
                            value={form.size}
                            onChange={(e: any) => setForm({ ...form, size: e.target.value })}
                            placeholder="e.g. 10.0 x 3.0"
                            type="text"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup
                                label="Target (kg)"
                                value={form.targetWeight}
                                onChange={(e: any) => setForm({ ...form, targetWeight: e.target.value })}
                            />
                            <InputGroup
                                label="Speed (m/hr)"
                                value={form.speedMhr}
                                onChange={(e: any) => setForm({ ...form, speedMhr: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isCreating || !form.orderNumber}
                            className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 mt-2"
                        >
                            {isCreating ? "Issuing..." : "Issue Order"}
                        </button>
                    </form>
                </div>

                {/* Queue */}
                <div className="lg:col-span-3 space-y-4">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Live Queue</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data?.map((item: any) => (
                            <div key={item._id} className="glass p-6 rounded-3xl border border-white/20 relative overflow-hidden group">
                                <div className={cn(
                                    "absolute top-0 right-0 w-1 h-full",
                                    item.status === "PENDING" ? "bg-amber-400" :
                                        item.status === "ACTIVE" ? "bg-indigo-500" : "bg-emerald-500"
                                )} />

                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.orderNumber}</span>
                                        <h3 className="text-lg font-bold text-slate-900">{item.customer}</h3>
                                    </div>
                                    <StatusBadge status={item.status} />
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Ruler className="w-4 h-4" />
                                        <span className="text-sm font-medium">{item.size} ({item.material})</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Scale className="w-4 h-4" />
                                        <span className="text-sm font-medium">{item.targetWeight} kg</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {item.status === "PENDING" && (
                                        <button
                                            onClick={() => updateStatus({ id: item._id, status: "ACTIVE" })}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all"
                                        >
                                            <Play className="w-3.5 h-3.5" /> Start Production
                                        </button>
                                    )}
                                    {item.status === "ACTIVE" && (
                                        <button
                                            onClick={() => updateStatus({ id: item._id, status: "COMPLETED" })}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all"
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                                        </button>
                                    )}
                                    <button className="px-4 py-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-600 transition-all">
                                        <Clock className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {!data && <div className="py-20 text-center text-slate-400 animate-pulse">Synchronizing with production...</div>}
                    {data?.length === 0 && <div className="py-20 glass rounded-3xl text-center text-slate-400 border-dashed border-2">No active work instructions.</div>}
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        PENDING: "bg-amber-50 text-amber-600",
        ACTIVE: "bg-indigo-50 text-indigo-600 animate-pulse",
        COMPLETED: "bg-emerald-50 text-emerald-600"
    };
    return (
        <span className={cn("px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest", styles[status])}>
            {status}
        </span>
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
