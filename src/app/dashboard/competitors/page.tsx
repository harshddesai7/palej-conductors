"use client";

import { BarChart3 } from "lucide-react";

export default function CompetitorsPage() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-slate-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Competitor Rates</h1>
            <p className="text-slate-500 max-w-sm">
                Market analysis and rate tracking will be implemented in <strong>Phase 2</strong>.
            </p>
        </div>
    );
}
