"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import AuthCard from "../_components/AuthCard";
import AuthHeader from "../_components/AuthHeader";
import PasswordStrengthBar from "../_components/PasswordStrengthBar";
import Button from "@/common/components/Button";
import FormField from "@/common/components/FormField";

// Inline SVG icons (esto lo puse asi mientras definimos q iconos vamos a usar en toda la pagina)
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);
const EmailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);
const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);
const ArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
);

export default function RegisterPage() {
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});
        setIsLoading(true);

        try {
            const formData = new FormData(formRef.current!);
            const email = String(formData.get("email"));
            const passwordValue = String(formData.get("password"));
            

            // Validaciones
            const errors: Record<string, string> = {};
            
            if (!email) errors.email = "El correo es requerido";
            if (!passwordValue) errors.password = "La contraseña es requerida";
            if (passwordValue.length < 8) errors.password = "Mínimo 8 caracteres";

            if (Object.keys(errors).length > 0) {
                setFieldErrors(errors);
                setIsLoading(false);
                return;
            }

            // aqui iria la logica con el backend, por ahora puse pa q redija de una al login"
            router.push("/dashboard");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error al iniciar sesión. Intenta nuevamente.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthCard>
            <AuthHeader
                title="Inicia Sesión"
                subtitle="Bienvenido de vuelta a tu aventura de aprendizaje"
                backHref="/"
                alternateText="¿No tienes cuenta?"
                alternateHref="/register"
                alternateLinkText="Regístrate"
            />

            {error && (
                <div className="alert alert-error mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
                

                <FormField
                    label="Correo Electrónico"
                    name="email"
                    type="email"
                    placeholder="tu@correo.com"
                    leftIcon={<EmailIcon />}
                    error={fieldErrors.email}
                    disabled={isLoading}
                    required
                    autoComplete="email"
                />

                <div>
                    <FormField
                        label="Contraseña"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        leftIcon={<LockIcon />}
                        showPasswordToggle
                        error={fieldErrors.password}
                        disabled={isLoading}
                        required
                        autoComplete="current-password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    isLoading={isLoading}
                    rightIcon={<ArrowIcon />}
                    className="mt-4"
                >
                    {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
            </form>
        </AuthCard>
    );
}
