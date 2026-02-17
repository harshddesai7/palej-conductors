"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Bare Calculator has been merged into Unified Calculator.
 * Redirect to /dashboard/calculator?mode=bare for Bare mode.
 */
export default function BareCalculatorRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/dashboard/calculator?mode=bare");
    }, [router]);

    return (
        <div className="min-h-[400px] flex items-center justify-center">
            <p className="text-slate-500 text-sm">Redirecting to Unified Calculator (Bare mode)...</p>
        </div>
    );
}
