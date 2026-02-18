"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const SearchDatabaseClient = dynamic(
    () => import("./SearchDatabaseClient"),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        ),
    }
);

export default function SearchDatabasePage() {
    return <SearchDatabaseClient />;
}
