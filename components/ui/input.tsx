import * as React from "react";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = "", type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={[
                    "flex w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900",
                    "placeholder:text-gray-400",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-capec-500/30 focus-visible:border-capec-500",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    className,
                ]
                    .filter(Boolean)
                    .join(" ")}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";

export { Input };
