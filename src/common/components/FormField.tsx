import { InputHTMLAttributes, ReactNode } from "react";
import Input from "./Input";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    showPasswordToggle?: boolean;
}

export default function FormField({
    label,
    error,
    leftIcon,
    rightIcon,
    showPasswordToggle,
    ...inputProps
}: FormFieldProps) {
    return (
        <div className="form-control w-full">
            {label && (
                <label className="label py-0 pb-1">
                    <span className="label-text font-medium text-gray-700 text-sm">{label}</span>
                </label>
            )}
            <Input
                leftIcon={leftIcon}
                rightIcon={rightIcon}
                showPasswordToggle={showPasswordToggle}
                error={!!error}
                {...inputProps}
            />
            {error && (
                <p className="text-error text-xs mt-1 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12" y2="16.01"/>
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}
