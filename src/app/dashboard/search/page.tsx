"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import SearchDatabaseClient from "./SearchDatabaseClient";

export default function SearchDatabasePage() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }
    return <SearchDatabaseClient />;
}
