"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { LogOut, User, Bell } from "lucide-react";

export function Header() {
    const { signOut } = useAuthActions();
    const user = useQuery(api.users.viewer);

    return (
        <header className="h-16 glass border-b border-white/20 flex items-center justify-between px-8 sticky top-0 z-30">
            <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Palej Conductors</span>
                <span className="text-slate-300">/</span>
                <span className="text-sm font-medium text-slate-700">Calculator</span>
            </div>

            <div className="flex items-center gap-6">
                <button className="text-slate-400 hover:text-slate-900 transition-colors">
                    <Bell className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-slate-900">{user?.name || "User"}</span>
                        <span className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">
                            {user?.email || "loading..."}
                        </span>
                    </div>
                    <div className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
                        <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="ml-2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Sign Out"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}
