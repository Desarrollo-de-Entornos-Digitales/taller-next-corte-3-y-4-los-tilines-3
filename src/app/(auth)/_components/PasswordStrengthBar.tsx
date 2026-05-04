"use client";

interface PasswordStrengthBarProps {
    password: string;
}

const requirements = [
    { label: "Mínimo 8 caracteres", test: (p: string) => p.length >= 8 },
    { label: "Al menos un número (0-9) o símbolo", test: (p: string) => /[0-9!@#$%^&*]/.test(p) },
    { label: "Minúsculas (a-z) y mayúsculas (A-Z)", test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
];

export default function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
    if (!password) return null;

    return (
        <div className="mt-2 space-y-1.5">
            {requirements.map((req) => {
                const passed = req.test(password);
                return (
                    <div key={req.label} className="flex items-center gap-2">
                        {passed ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-500 shrink-0">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        ) : (
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 shrink-0" />
                        )}
                        <span className={`text-xs transition-colors ${passed ? "text-green-600" : "text-gray-400"}`}>
                            {req.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
