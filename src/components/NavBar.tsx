'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useAuth } from '../context/AuthContext';

export default function NavBar() {
    const router = useRouter();
    const { isAdmin, canManageCourses } = useAuth();

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        // Redirigir al login y recargar para limpiar estados
        router.push('/login');
        router.refresh();
    };
    return (
        <div
            className="navbar bg-base-100 px-4 sticky top-0 z-50 shadow-md"
            style={{
                borderBottomLeftRadius: 15,
                borderBottomRightRadius: 15,
            }}
        >
            <div className="flex-1">
                <a className="btn btn-ghost p-0 hover:bg-transparent">
                    <img src="/Otly.svg" alt="otly logo" className="h-10 w-auto" />
                </a>
            </div>

            <div className="absolute left-1/2 transform -translate-x-1/2 hidden lg:flex gap-10">
                {(!isAdmin && !canManageCourses) && (
                    <>
                        <Link
                            href="/feed"
                            className="text-sm font-bold uppercase tracking-wider hover:text-primary transition-colors cursor-pointer"
                        >
                            Feed
                        </Link>
                        <Link
                            href="/courses"
                            className="text-sm font-bold uppercase tracking-wider hover:text-primary transition-colors cursor-pointer"
                        >
                            Courses
                        </Link>
                    </>
                )}
                {(isAdmin || canManageCourses) && (
                    <>
                        <Link
                            href="/modules/manage"
                            className="text-sm font-bold uppercase tracking-wider text-[#4A86F7] hover:text-blue-800 transition-colors cursor-pointer"
                        >
                            Gestionar Unidades
                        </Link>
                        <Link
                            href="/ejercicios/manage"
                            className="text-sm font-bold uppercase tracking-wider text-[#4A86F7] hover:text-blue-800 transition-colors cursor-pointer"
                        >
                            Gestionar Ejercicios
                        </Link>
                    </>
                )}
            </div>

            <div className="flex gap-4 items-center">
                
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                        <div className="w-10 rounded-full border-2 border-gray-100">
                            <img
                                alt="Avatar"
                                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                            />
                        </div>
                    </div>
                    <ul
                        tabIndex={-1}
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow-xl border border-gray-100"
                    >
                        <li className="menu-title px-4 py-2 text-xs font-bold text-gray-400 uppercase">Account</li>
                        <li>
                            <Link href="/profile">Profile</Link>
                        </li>
                        <li>
                            <a>Settings</a>
                        </li>
                        <div className="divider my-0"></div>
                        <li>
                            <a className="text-error font-bold" onClick={handleLogout}>
                                Logout
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
