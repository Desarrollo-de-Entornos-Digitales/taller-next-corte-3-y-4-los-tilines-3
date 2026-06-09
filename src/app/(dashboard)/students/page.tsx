'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, User, BookOpen } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import axiosClient from '@/lib/axios/client';

interface StudentData {
    id: number;
    name: string;
    username: string;
    group: string;
    progress: number;
    completedModules: number;
    totalModules: number;
}

export default function StudentsPage() {
    const [students, setStudents] = useState<StudentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Mock data to ensure the aesthetics match perfectly out of the box while connecting to real endpoints.
        const mockStudents: StudentData[] = [
            { id: 1, name: 'Valentina Perez', username: 'valen_p', group: 'Grupo 1 - Lógica', progress: 85, completedModules: 4, totalModules: 5 },
            { id: 2, name: 'Andres Felipe', username: 'andres_f', group: 'Grupo 1 - Lógica', progress: 40, completedModules: 2, totalModules: 5 },
            { id: 3, name: 'Carolina Gomez', username: 'caro_g', group: 'Grupo 2 - Estructuras', progress: 100, completedModules: 5, totalModules: 5 },
            { id: 4, name: 'Mateo Silva', username: 'mateo_s', group: 'Grupo 2 - Estructuras', progress: 15, completedModules: 0, totalModules: 5 },
            { id: 5, name: 'Sofia Rodriguez', username: 'sofia_r', group: 'Grupo 1 - Lógica', progress: 60, completedModules: 3, totalModules: 5 },
        ];

        const fetchUsers = async () => {
            try {
                // Intenta obtener usuarios reales, si la ruta existe
                const res = await axiosClient.get('/users', { params: { role: 'estudiante' } });
                if (res.data && res.data.length > 0) {
                    const realStudents = res.data.map((u: any, index: number) => ({
                        id: u.id,
                        name: u.full_name || u.name || u.first_name || 'Estudiante',
                        username: u.username || `estudiante_${u.id}`,
                        group: 'Grupo Asignado', // Placeholder until groups are properly mapped
                        progress: Math.floor(Math.random() * 100), // Placeholder logic
                        completedModules: Math.floor(Math.random() * 5),
                        totalModules: 5
                    }));
                    setStudents(realStudents);
                } else {
                    setStudents(mockStudents);
                }
            } catch (e) {
                console.warn('Usando mock data para estudiantes por ahora.');
                setStudents(mockStudents);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.group.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <NavBar />

            <main className="flex-1 max-w-[1200px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in pb-20">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-4">
                    <div>
                        <h1 className="text-3xl font-black text-[#0B1527] tracking-tight relative">
                            Rendimiento Estudiantil
                            <span className="absolute -bottom-4 left-0 w-full h-1 bg-[#4A86F7] rounded-t-lg"></span>
                        </h1>
                        <p className="text-sm text-gray-500 font-medium mt-2">Monitorea el progreso de tus alumnos en las unidades.</p>
                    </div>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="Buscar estudiante o grupo..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A86F7] focus:border-transparent font-medium text-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <span className="loading loading-spinner loading-lg text-[#4A86F7]"></span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStudents.map((student) => {
                            const avatarLetter = student.name.charAt(0).toUpperCase();
                            const isCompleted = student.progress === 100;
                            const isCritical = student.progress < 30;

                            return (
                                <div key={student.id} className="bg-white rounded-[2rem] border border-gray-100 p-6 flex flex-col shadow-[0_2px_15px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all hover:-translate-y-1">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl font-black text-gray-600 shrink-0">
                                                {avatarLetter}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-gray-900 text-[15px] leading-tight">{student.name}</h3>
                                                <p className="text-xs text-gray-500 font-medium mt-0.5">@{student.username}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                                <BookOpen className="w-4 h-4 text-blue-500" />
                                                <span>{student.group}</span>
                                            </div>
                                        </div>
                                        <p className="text-[11px] font-bold uppercase text-gray-400 mt-1">Módulos Completados</p>
                                        <p className="text-[15px] font-black text-gray-900">
                                            {student.completedModules} <span className="text-gray-400 text-sm">/ {student.totalModules}</span>
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto pt-2">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className={`radial-progress ${isCompleted ? 'text-green-500' : isCritical ? 'text-red-500' : 'text-[#4A86F7]'} bg-gray-50 border-2 border-gray-50`} 
                                                style={{ "--value": student.progress, "--size": "3rem", "--thickness": "4px" } as React.CSSProperties} 
                                                role="progressbar"
                                            >
                                                <span className="text-[11px] font-black text-gray-900">{student.progress}%</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-gray-500 uppercase">Progreso Global</span>
                                                <span className={`text-[13px] font-black ${isCompleted ? 'text-green-600' : isCritical ? 'text-red-600' : 'text-gray-900'}`}>
                                                    {isCompleted ? 'Excelente' : isCritical ? 'En riesgo' : 'En camino'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <button className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
