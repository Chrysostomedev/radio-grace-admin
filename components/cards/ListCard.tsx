"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";

export interface ListItem {
    id?:     number | string;
    name:    string;
    subText: string;
    href?:   string;
}

interface ListCardProps {
    title:        string;
    items:        ListItem[];
    viewAllHref?: string;
    viewAllText?: string;
}

export default function ListCard({
    title,
    items,
    viewAllHref = "#",
    viewAllText = "Voir tous",
}: ListCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4 h-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-[15px]">{title}</h3>
                {viewAllHref && (
                    <Link
                        href={viewAllHref}
                        className="flex items-center gap-1 text-[12px] font-bold text-slate-500 hover:text-[#f97316] transition-colors"
                    >
                        {viewAllText}
                        <ChevronRight size={14} strokeWidth={2.5} />
                    </Link>
                )}
            </div>

            {/* Liste */}
            <div className="flex flex-col divide-y divide-slate-50">
                {items.map((item, i) => {
                    const dest = item.href ?? (item.id ? `/admin/projets/${item.id}` : "#");
                    return (
                        <Link
                            key={i}
                            href={dest}
                            className="group flex items-center justify-between py-3.5 hover:bg-slate-50 -mx-2 px-2 rounded-xl transition-colors"
                        >
                            <div className="space-y-0.5 min-w-0">
                                <p className="font-bold text-slate-800 text-[13px] leading-tight truncate">
                                    {item.name}
                                </p>
                                <p className="text-[12px] text-slate-400 font-medium">
                                    {item.subText}
                                </p>
                            </div>
                            <ChevronRight
                                size={18}
                                strokeWidth={2.5}
                                className="text-slate-300 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0 ml-2"
                            />
                        </Link>
                    );
                })}

                {items.length === 0 && (
                    <p className="py-6 text-center text-slate-400 text-sm italic">
                        Aucun élément
                    </p>
                )}
            </div>
        </div>
    );
}
