'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import EmailInput from '@/common/components/emailInput';
import PasswordInput from '@/common/components/passwordInput';
import Button from '@/common/components/Button';
import { useAuth } from '@/context/AuthContext';

import { loginService } from './services/login.service';

function decodeJwtPayload(token: string): Record<string, any> | null {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    try {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
        const payload = atob(padded);
        return JSON.parse(payload) as Record<string, any>;
    } catch {
        return null;
    }
}

function resolveRoleName(source: Record<string, any> | null | undefined): string {
    if (!source) return '';

    const directRole =
        source.roleName ??
        source.role_name ??
        source.role ??
        source.role?.name ??
        source.role?.slug ??
        source.role?.title;

    if (typeof directRole === 'string' && directRole.trim()) {
        return directRole.toLowerCase();
    }

    const roles = source.roles ?? source.authorities;
    if (Array.isArray(roles) && roles.length > 0) {
        const firstRole = roles[0];
        if (typeof firstRole === 'string') return firstRole.toLowerCase();
        if (firstRole && typeof firstRole === 'object') {
            const nestedRole = firstRole.name ?? firstRole.slug ?? firstRole.title;
            if (typeof nestedRole === 'string' && nestedRole.trim()) {
                return nestedRole.toLowerCase();
            }
        }
    }

    return '';
}

export default function Login() {
    const router = useRouter();
    const { setAuthData } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const response = await loginService.login(email, password);
            console.info('Login success:', response.data);

            const token =
                response.data?.access_token ??
                response.data?.token ??
                response.data?.data?.access_token ??
                response.data?.data?.token ??
                response.data?.data?.accessToken ??
                response.data?.accessToken;

            if (!token) {
                setError('No se recibió un token válido del servidor.');
                return;
            }

            const rawUser =
                response.data?.user ??
                response.data?.data?.user ??
                response.data?.data ??
                response.data?.account ??
                response.data?.profile ??
                response.data;

            const tokenPayload = decodeJwtPayload(token);
            const roleName = resolveRoleName(rawUser) || resolveRoleName(tokenPayload);

            if (rawUser) {
                const normalizedUser = {
                    ...rawUser,
                    roleName,
                };
                setAuthData(token, normalizedUser);
            } else {
                localStorage.setItem('access_token', token);
                if (roleName) {
                    localStorage.setItem('user', JSON.stringify({ roleName }));
                }
            }

            router.push('/feed');
        } catch (err: any) {
            console.error('Login error:', err);
            if (err.response) {
                setError(err.response.data?.message || 'Credenciales incorrectas.');
            } else {
                setError('No se pudo conectar con el servidor.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-blue-700">
            <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center rounded-tr-[3rem] rounded-br-[3rem] px-8 md:px-16 lg:px-24 xl:px-32 relative z-10 shadow-2xl">
                <div className="w-full max-w-sm">
                    <h1 className="text-4xl font-bold text-gray-900 mb-10">Welcome back!</h1>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
                            <span>{error}</span>
                        </div>
                    )}

                    <form className="flex flex-col gap-6" onSubmit={(e) => void handleSubmit(e)}>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <EmailInput name="email" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-700">Password</label>
                            </div>
                            <PasswordInput name="password" />
                        </div>

                        <div className="mt-2 text-center w-full [&_button]:w-full [&_button]:bg-blue-600 [&_button]:text-white [&_button]:border-none [&_button]:hover:bg-blue-700 [&_button]:rounded-lg">
                            <Button name={isLoading ? 'Signing in...' : 'Sign In'} />
                        </div>
                    </form>

                    <div className="my-8 flex items-center justify-between">
                        <span className="w-1/5 border-b border-gray-300 lg:w-2/5"></span>
                        <span className="text-xs text-center text-gray-400 uppercase">OR</span>
                        <span className="w-1/5 border-b border-gray-300 lg:w-2/5"></span>
                    </div>

                    <button className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200">
                        Continue with Google
                    </button>

                    <div className="mt-8">
                        <button
                            type="button"
                            onClick={() => router.push('/register')}
                            className="text-sm text-blue-600 hover:underline italic bg-transparent border-none p-0 cursor-pointer"
                        >
                            I don&apos;t have an account
                        </button>
                    </div>
                </div>
            </div>

            <div className="hidden md:flex md:w-1/2 items-center justify-center relative">
                {/* Space for image */}
            </div>
        </div>
    );
}
