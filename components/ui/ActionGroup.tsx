"use client";

import { LucideIcon } from "lucide-react";

export type ActionButton = {
    label:    string;
    icon:     LucideIcon;
    onClick:  () => void;
    variant?: "primary" | "secondary";
};

interface ActionGroupProps {
    actions?: ActionButton[];
}

export default function ActionGroup({ actions = [] }: ActionGroupProps) {
    if (!actions.length) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
            {actions.map((action, i) => {
                const Icon      = action.icon;
                const isPrimary = action.variant === "primary";
                return (
                    <button
                        key={i}
                        onClick={action.onClick}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[13px] transition-all active:scale-95
                            ${isPrimary
                                ? "bg-[#f97316] text-white hover:opacity-90 shadow-md shadow-orange-200"
                                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                            }`}
                    >
                        <Icon size={16} strokeWidth={2.5} />
                        <span>{action.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
