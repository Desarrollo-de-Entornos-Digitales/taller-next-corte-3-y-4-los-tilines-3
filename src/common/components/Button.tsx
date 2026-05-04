"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    fullWidth?: boolean;
}

export default function Button({
    children,
    variant = "primary",
    size = "md",
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className = "",
    disabled,
    ...props
}: ButtonProps) {
    const variantMap: Record<string, string> = {
        primary: "btn-primary text-white",
        secondary: "btn-secondary text-white",
        outline: "btn-outline",
        ghost: "btn-ghost",
        danger: "btn-error text-white",
        success: "btn-success text-white",
    };

    const sizeMap: Record<string, string> = {
        sm: "btn-sm",
        md: "",
        lg: "btn-lg",
    };

    return (
        <button
            className={`btn ${variantMap[variant]} ${sizeMap[size]} ${fullWidth ? "w-full" : ""} gap-2 ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="loading loading-spinner loading-sm" />
            ) : (
                leftIcon
            )}
            {children}
            {!isLoading && rightIcon}
        </button>
    );
}
