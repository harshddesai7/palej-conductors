"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
    if (!convex) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
                <p className="text-slate-600 text-center">
                    Convex URL not configured. Set NEXT_PUBLIC_CONVEX_URL in your environment.
                </p>
            </div>
        );
    }
    return (
        <ConvexAuthProvider client={convex}>
            {children}
        </ConvexAuthProvider>
    );
}
