"use client";

import * as React from "react";
import {
    Controller,
    FormProvider,
    useFormContext,
    type ControllerProps,
    type FieldPath,
    type FieldValues,
} from "react-hook-form";
import { Label } from "@/components/ui/label";

// ── Form (wraps FormProvider) ────────────────────────────────────────────────
const Form = FormProvider;

// ── FormField ────────────────────────────────────────────────────────────────
type FormFieldContextValue<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = { name: TName };

const FormFieldContext = React.createContext<FormFieldContextValue>(
    {} as FormFieldContextValue
);

function FormField<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: ControllerProps<TFieldValues, TName>) {
    return (
        <FormFieldContext.Provider value={{ name: props.name }}>
            <Controller {...props} />
        </FormFieldContext.Provider>
    );
}

// ── FormItem ─────────────────────────────────────────────────────────────────
const FormItemContext = React.createContext<{ id: string }>({ id: "" });

const FormItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className = "", ...props }, ref) => {
    const id = React.useId();
    return (
        <FormItemContext.Provider value={{ id }}>
            <div ref={ref} className={["space-y-1.5", className].filter(Boolean).join(" ")} {...props} />
        </FormItemContext.Provider>
    );
});
FormItem.displayName = "FormItem";

// ── FormLabel ────────────────────────────────────────────────────────────────
const FormLabel = React.forwardRef<
    React.ElementRef<typeof Label>,
    React.ComponentPropsWithoutRef<typeof Label>
>(({ className = "", ...props }, ref) => {
    const { id } = React.useContext(FormItemContext);
    return <Label ref={ref} htmlFor={id} className={className} {...props} />;
});
FormLabel.displayName = "FormLabel";

// ── FormControl ──────────────────────────────────────────────────────────────
const FormControl = React.forwardRef<
    React.ElementRef<"div">,
    React.ComponentPropsWithoutRef<"div">
>(({ ...props }, ref) => {
    const { id } = React.useContext(FormItemContext);
    return <div ref={ref} id={id} {...props} />;
});
FormControl.displayName = "FormControl";

// ── FormDescription ──────────────────────────────────────────────────────────
const FormDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className = "", ...props }, ref) => (
    <p
        ref={ref}
        className={["text-xs text-gray-500", className].filter(Boolean).join(" ")}
        {...props}
    />
));
FormDescription.displayName = "FormDescription";

// ── FormMessage ──────────────────────────────────────────────────────────────
const FormMessage = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className = "", children, ...props }, ref) => {
    const { name } = React.useContext(FormFieldContext);
    const { formState } = useFormContext();

    const fieldError = name
        ? (formState.errors as Record<string, { message?: string }>)[name]
        : undefined;

    const body = children ?? fieldError?.message;
    if (!body) return null;

    return (
        <p
            ref={ref}
            className={["text-xs font-medium text-red-500", className]
                .filter(Boolean)
                .join(" ")}
            {...props}
        >
            {body}
        </p>
    );
});
FormMessage.displayName = "FormMessage";

export {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
};
