"use client";

import { Database } from "lucide-react";

export default function FabricationPage() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center">
                <Database className="w-10 h-10 text-slate-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Fabrication List</h1>
            <p className="text-slate-500 max-w-sm">
                This module is scheduled for <strong>Phase 2</strong>. It will involve importing existing Excel data and enabling new entry forms.
            </p>
        </div>
    );
}
