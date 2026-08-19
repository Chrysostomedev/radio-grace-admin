"use client";

import { Loader2 } from "lucide-react";

interface FormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger";
    isLoading?: boolean;
    children: React.ReactNode;
}

export default function FormButton({
    variant = "primary",
    isLoading = false,
    children,
    className = "",
    disabled,
   ...props
}: FormButtonProps) {
    const base = "flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-[#163A2C] text-white hover:bg-[#0E241C] shadow-md shadow-[#163A2C]/20",
        secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
        danger: "bg-red-600 text-white hover:bg-red-700",
    };

    return (
        <button
            {...props}
            disabled={disabled || isLoading}
            className={`${base} ${variants[variant]} ${className}`}
        >
            {isLoading && <Loader2 size={16} className="animate-spin shrink-0" />}
            {children}
        </button>
    );
}