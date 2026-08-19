import * as React from "react";

type Variant = "default" | "ghost" | "outline" | "destructive" | "link";
type Size    = "default" | "sm" | "lg" | "icon";

const variantClasses: Record<Variant, string> = {
    default:     "bg-capec-500 text-white hover:bg-capec-600",
    ghost:       "bg-transparent hover:bg-gray-100 text-gray-700",
    outline:     "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    link:        "text-capec-600 underline underline-offset-2 hover:text-capec-700 p-0",
};

const sizeClasses: Record<Size, string> = {
    default: "h-10 px-4 py-2 text-sm",
    sm:      "h-8  px-3 py-1 text-xs",
    lg:      "h-12 px-6 py-3 text-base",
    icon:    "h-9  w-9",
};

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className = "",
            variant = "default",
            size = "default",
            asChild = false,
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        const base =
            "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-capec-500/50 disabled:pointer-events-none disabled:opacity-50";

        const classes = [
            base,
            variantClasses[variant],
            sizeClasses[size],
            className,
        ]
            .filter(Boolean)
            .join(" ");

        if (asChild && React.isValidElement(children)) {
            return React.cloneElement(
                children as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
                { className: classes, ...props } as any
            );
        }

        return (
            <button ref={ref} className={classes} disabled={disabled} {...props}>
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button };
