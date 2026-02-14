"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Calculator,
    Database,
    BarChart3,
    Settings,
    ChevronRight,
    Zap,
    Box,
    TrendingDown
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Unified Calculator", href: "/dashboard/calculator", icon: Zap },
    { name: "Bare Calculator", href: "/dashboard/bare", icon: Box },
    { name: "Factor Calculator", href: "/dashboard/factor", icon: Calculator },
    { name: "LME Copper", href: "/dashboard/lme", icon: TrendingDown },
    { name: "Fabrication List", href: "/dashboard/fabrication", icon: Database },
    { name: "Competitor Rates", href: "/dashboard/competitors", icon: BarChart3 },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 h-full glass border-r border-white/20 flex flex-col">
            <div className="p-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">PC</span>
                    </div>
                    <span className="font-bold text-slate-900 tracking-tight">Palej Conductors</span>
                </div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200",
                                isActive
                                    ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                                    : "text-slate-600 hover:bg-white/50 hover:text-slate-900"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900")} />
                                <span className="text-sm font-medium">{item.name}</span>
                            </div>
                            {isActive && <ChevronRight className="w-4 h-4 text-white/50" />}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/10">
                <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-white/50 rounded-xl transition-all"
                >
                    <Settings className="w-5 h-5" />
                    <span className="text-sm font-medium">Settings</span>
                </Link>
            </div>
        </div>
    );
}
