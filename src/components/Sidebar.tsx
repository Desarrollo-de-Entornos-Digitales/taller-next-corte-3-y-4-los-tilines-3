'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Feed Principal', path: '/feed', icon: '🏠' },
        { name: 'Cursos', path: '/courses', icon: '📚' },
        { name: 'Módulos', path: '/modules/manage', icon: '🧩' },
        { name: 'Ejercicios', path: '/ejercicios/manage', icon: '📝' },
        { name: 'Estudiantes', path: '/students', icon: '👥' }, // Placeholder para el futuro
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col hidden md:flex h-full shadow-[4px_0_24px_-10px_rgba(0,0,0,0.02)]">
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
                                <span className="text-lg">{item.icon}</span>
                                <span>{item.name}</span>
                                {isActive && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#4A86F7]"></span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            
            <div className="mt-auto p-6">
                <div className="bg-blue-50 rounded-2xl p-4 text-center">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-lg">
                        💡
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">¿Necesitas ayuda?</h4>
                    <p className="text-xs text-gray-500 mb-3">Revisa la documentación para gestionar contenido.</p>
                    <button className="text-xs font-bold bg-white text-[#4A86F7] px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all w-full">
                        Ver Guía
                    </button>
                </div>
            </div>
        </aside>
    );
}
