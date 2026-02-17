"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { LogOut, User, Bell, Menu } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";

export function Header() {
    const { signOut } = useAuthActions();
    const user = useQuery(api.users.viewer);
    const { toggle } = useSidebar();

    return (
        <header className="h-16 glass border-b border-white/20 flex items-center justify-between px-4 md:px-6 lg:px-8 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggle}
                    className="p-2 -ml-2 text-slate-400 hover:text-slate-900 lg:hidden"
                    aria-label="Toggle Menu"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 hidden sm:inline">Palej Conductors</span>
                    <span className="text-slate-300 hidden sm:inline">/</span>
                    <span className="text-sm font-medium text-slate-700">Calculator</span>
                </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6">
                <button className="text-slate-400 hover:text-slate-900 transition-colors hidden sm:block">
                    <Bell className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 sm:gap-3 pl-3 sm:pl-6 border-l border-white/10">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-slate-900">{user?.name || "User"}</span>
                        <span className="text-[10px] text-slate-500 font-medium truncate max-w-[100px] sm:max-w-[150px] hidden xs:block">
                            {user?.email || "loading..."}
                        </span>
                    </div>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm shrink-0">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Sign Out"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}
