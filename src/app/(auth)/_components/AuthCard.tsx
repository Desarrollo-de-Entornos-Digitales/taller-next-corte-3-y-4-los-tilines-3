import { ReactNode } from "react";
import AuthBranding from "./AuthBranding";

interface AuthCardProps {
    children: ReactNode;
}

export default function AuthCard({ children }: AuthCardProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
            <div className="flex w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl min-h-[650px]">
                {/* Left: Form panel */}
                <div className="flex-1 bg-white flex flex-col p-10 lg:p-14">
                    {children}
                </div>

                {/* Right: Branding panel */}
                <AuthBranding />
            </div>
        </div>
    );
}
