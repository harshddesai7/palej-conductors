"use client";

import { useEffect } from "react";
import { Database, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function SearchError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Search Database error:", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
            <Database className="w-16 h-16 text-slate-300 mb-4" />
            <h2 className="text-lg font-bold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-500 mb-6 max-w-md">
                The Search Database page encountered an error. Try refreshing or return to the calculator.
            </p>
            <div className="flex gap-3">
                <button
                    onClick={reset}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Try again
                </button>
                <Link
                    href="/dashboard/calculator"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                    Back to Calculator
                </Link>
            </div>
        </div>
    );
}
