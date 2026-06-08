'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import EmailInput from '@/common/components/emailInput';
import PasswordInput from '@/common/components/passwordInput';
import Button from '@/common/components/Button';
import Input from '@/common/components/Input';

import { getRoles, Role } from '../../services/roleService';

import { registerService } from './services/register.service';

export default function Register() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Roles hardcoded to guarantee they are available for registration
    // even if backend takes time to respond or is empty

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const username = formData.get('username') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const bio = formData.get('bio') as string;
        const roleName = formData.get('roleName') as string;

        try {
            const response = await registerService.register(username, email, password, bio, roleName);
            console.info('Registration success:', response.data);
            alert('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
            router.push('/login');
        } catch (err: any) {
            console.error('Registration error details:', err);

            if (err.response) {
                const message = err.response.data?.message || 'Error en el registro. Verifica los datos.';
                setError(Array.isArray(message) ? message.join(', ') : message);
            } else if (err.request) {
                setError('No se pudo conectar con el servidor. ¿Está el backend encendido en el puerto 3001?');
            } else {
                setError('Ocurrió un error inesperado al intentar registrarte.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-teal-600">
            <div className="w-full md:w-[60%] lg:w-[50%] bg-white flex flex-col justify-center items-center rounded-tr-[3rem] rounded-br-[3rem] px-8 md:px-16 lg:px-24 py-12 relative z-10 shadow-2xl">
                <div className="w-full max-w-lg">
                    <h1 className="text-4xl font-bold text-gray-900 mb-6">Let&apos;s get you started!</h1>

                    {error && (
                        <div
                            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
                            role="alert"
                        >
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <form className="flex flex-col gap-6" onSubmit={(e) => void handleSubmit(e)}>
                        <div className="flex flex-col gap-2 w-full">
                            <label className="text-sm font-medium text-gray-700">Nombre completo</label>
                            <Input
                                name="username"
                                placeholder="Nombre completo"
                                className="bg-gray-50 border-gray-200"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <EmailInput name="email" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <PasswordInput name="password" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Bio</label>
                            <Input
                                name="bio"
                                placeholder="Cuéntanos sobre ti"
                                className="bg-gray-50 border-gray-200"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Rol</label>
                            <select
                                name="roleName"
                                defaultValue="ESTUDIANTE"
                                className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                required
                            >
                                <option value="ESTUDIANTE">Estudiante</option>
                                <option value="PROFESOR">Profesor</option>
                                <option value="ADMIN">Administrador</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                            <input type="checkbox" className="checkbox checkbox-sm rounded-sm" id="terms" required />
                            <label
                                htmlFor="terms"
                                className="text-sm text-gray-800 font-medium cursor-pointer select-none"
                            >
                                I agree to all the <span className="text-red-400">Terms</span> and{' '}
                                <span className="text-red-400">Privacy Policies</span>
                            </label>
                        </div>

                        <div className="mt-4 text-center w-full [&_button]:w-full [&_button]:bg-blue-600 [&_button]:text-white [&_button]:border-none [&_button]:hover:bg-blue-700 [&_button]:rounded-lg">
                            <Button name={isLoading ? 'Creando cuenta...' : 'Create account'} />
                        </div>
                    </form>
                </div>
            </div>

            <div className="hidden md:flex md:w-[40%] lg:w-[50%] items-center justify-center relative">
                {/* Puedes añadir una imagen aquí usando su generate_image si quieres */}
            </div>
        </div>
    );
}
