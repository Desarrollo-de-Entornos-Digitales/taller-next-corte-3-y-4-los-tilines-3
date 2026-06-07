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
                <Link href="/feed" className="text-sm font-bold uppercase tracking-wider hover:text-primary transition-colors cursor-pointer">Feed</Link>
                <Link href="/courses" className="text-sm font-bold uppercase tracking-wider hover:text-primary transition-colors cursor-pointer">Courses</Link>
                {(isAdmin || canManageCourses) && (
                    <Link href="/ejercicios/manage" className="text-sm font-bold uppercase tracking-wider text-[#4A86F7] hover:text-blue-800 transition-colors cursor-pointer">Manage Exercises</Link>
                )}
            </div>

            <div className="flex gap-4 items-center">
                <div className="relative hidden sm:block">
                    <input type="text" placeholder="Search" className="input input-bordered bg-gray-50 h-10 w-48 lg:w-64 rounded-full pr-10" />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                
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
                        <li><a>Profile</a></li>
                        <li><a>Settings</a></li>
                        <div className="divider my-0"></div>
                        <li><a className="text-error font-bold" onClick={handleLogout}>Logout</a></li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
