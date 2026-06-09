'use client';

import { Home, Book, Trophy, Puzzle, PenTool, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
    const pathname = usePathname();
    const { isAdmin, canManageCourses, isStudent } = useAuth();

    const navItems = [
        { name: 'Feed Principal', path: '/feed', icon: <Home className="w-5 h-5" />, show: isStudent },
        { name: 'Courses', path: '/courses', icon: <Book className="w-5 h-5" />, show: isStudent },
        { name: 'Logros', path: '/logros', icon: <Trophy className="w-5 h-5" />, show: true },
        { name: 'Unidades', path: '/modules/manage', icon: <Puzzle className="w-5 h-5" />, show: canManageCourses },
        { name: 'Ejercicios', path: '/ejercicios/manage', icon: <PenTool className="w-5 h-5" />, show: canManageCourses },
        { name: 'Estudiantes', path: '/students', icon: <Users className="w-5 h-5" />, show: isAdmin },
    ].filter(item => item.show);

    return (
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col hidden md:flex shadow-[4px_0_24px_-10px_rgba(0,0,0,0.02)]">
            <div className="p-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Menú de Gestión</p>
                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname?.startsWith(item.path);
                        return (
                            <Link
                                key={item.name}
                                href={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                                    isActive
                                        ? 'bg-[#4A86F7]/10 text-[#4A86F7] font-bold'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                <span className="flex items-center justify-center text-lg">{item.icon}</span>
                                <span>{item.name}</span>
                                {isActive && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#4A86F7]"></span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
}
