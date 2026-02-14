"use client";

import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading } = useConvexAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Background glow effects */}
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-indigo-50/30 rounded-full blur-[120px] -z-10" />
                <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-50/30 rounded-full blur-[120px] -z-10" />

                <Header />
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
