"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Calculator,
    Settings,
    ChevronRight,
    Zap,
    TrendingDown,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";

const navigation = [
    { name: "Unified Calculator", href: "/dashboard/calculator", icon: Zap },
    { name: "Factor Calculator", href: "/dashboard/factor", icon: Calculator },
    { name: "LME Copper", href: "/dashboard/lme", icon: TrendingDown },
];

export function Sidebar() {
    const pathname = usePathname();
    const { isOpen, setIsOpen, isCollapsed } = useSidebar();

    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar Content */}
            <div className={cn(
                "fixed inset-y-0 left-0 lg:relative z-50 flex flex-col glass border-r border-white/20 transition-all duration-300 ease-in-out h-full",
                // Mobile state: slide from left
                isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                // Desktop state: collapsed or full
                isCollapsed ? "lg:w-20" : "w-64"
            )}>
                {/* Mobile Close Button */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-900 lg:hidden"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className={cn("p-6", isCollapsed && "lg:px-4 lg:text-center")}>
                    <div className={cn("flex items-center gap-3", isCollapsed && "lg:justify-center")}>
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                            <span className="text-white font-bold text-lg">PC</span>
                        </div>
                        {!isCollapsed && (
                            <span className="font-bold text-slate-900 tracking-tight whitespace-nowrap">Palej Conductors</span>
                        )}
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                title={isCollapsed ? item.name : undefined}
                                className={cn(
                                    "group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200",
                                    isActive
                                        ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                                        : "text-slate-600 hover:bg-white/50 hover:text-slate-900",
                                    isCollapsed && "lg:justify-center lg:px-0"
                                )}
                            >
                                <div className={cn("flex items-center gap-3", isCollapsed && "lg:gap-0")}>
                                    <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900")} />
                                    {!isCollapsed && (
                                        <span className="text-sm font-medium whitespace-nowrap">{item.name}</span>
                                    )}
                                </div>
                                {!isCollapsed && isActive && <ChevronRight className="w-4 h-4 text-white/50" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <Link
                        href="/dashboard/settings"
                        title={isCollapsed ? "Settings" : undefined}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-slate-900 hover:bg-white/50 rounded-xl transition-all",
                            isCollapsed && "lg:justify-center lg:px-0 lg:gap-0"
                        )}
                    >
                        <Settings className="w-5 h-5 shrink-0" />
                        {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
                    </Link>
                </div>
            </div>
        </>
    );
}
