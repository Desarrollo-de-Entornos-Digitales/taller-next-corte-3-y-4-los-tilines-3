'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { moduleService, ModuleEntity } from '../../services/moduleService';
import ManagementLayout from '../../../../components/ManagementLayout';

export default function ManageModulesPage() {
    const router = useRouter();
    const [modules, setModules] = useState<ModuleEntity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const CARD_COLORS = ['bg-[#E94D8E]', 'bg-[#9B4DFF]', 'bg-[#FFD13B]', 'bg-[#34D399]', 'bg-[#4A86F7]'];
    const getColor = (index: number) => CARD_COLORS[index % CARD_COLORS.length];

    useEffect(() => {
        loadModules();
    }, []);

    const loadModules = async () => {
        try {
            setLoading(true);
            const data = await moduleService.getAll();
            setModules(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load modules.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('¿Estás seguro de que deseas eliminar este módulo?')) {
            try {
                await moduleService.remove(id);
                await loadModules();
            } catch (err) {
                console.error(err);
                alert('Failed to delete module');
            }
        }
    };

    return (
        <ManagementLayout>
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
                <header className="mb-8 rounded-[2rem] bg-white px-8 py-6 shadow-sm ring-1 ring-black/5">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Panel de Control</p>
                            <h1 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl text-gray-900">
                                Gestión de Módulos
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm text-zinc-600">
                                Administra los módulos de aprendizaje. Puedes asignar ejercicios a cada módulo
                                posteriormente.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/modules/create')}
                            className="bg-[#4A86F7] hover:bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-md transition-all active:scale-95"
                        >
                            + Nuevo Módulo
                        </button>
                    </div>
                </header>

                {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium">{error}</div>}

                {loading ? (
                    <div className="text-center py-20">
                        <span className="loading loading-spinner loading-lg text-[#4A86F7]"></span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {modules.map((mod, index) => (
                            <div
                                key={mod.id}
                                className="bg-white rounded-[1.5rem] shadow-[0_4px_24px_-8px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col justify-between group hover:-translate-y-1 transition-transform duration-300"
                            >
                                <div className={`h-40 ${getColor(index)} relative`}>
                                    <div className="absolute top-4 right-4 bg-white/25 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm shadow-sm">
                                        Nivel {mod.level_order}
                                    </div>
                                    <div className="absolute top-4 left-4 bg-black/10 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm shadow-sm">
                                        Grupo {mod.course_id || 'N/A'}
                                    </div>
                                </div>
                                
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-xl font-extrabold text-gray-900 mb-2 group-hover:text-[#4A86F7] transition-colors line-clamp-1">
                                        {mod.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-6 font-medium">
                                        {mod.description}
                                    </p>

                                    <div className="flex gap-2 mt-auto">
                                        <button
                                            onClick={() => router.push(`/modules/edit/${mod.id}`)}
                                            className="flex-1 bg-white hover:bg-[#4A86F7] text-[#4A86F7] hover:text-white py-2.5 rounded-xl text-sm font-bold transition-all border border-blue-200 shadow-sm"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(mod.id)}
                                            className="flex-1 bg-white hover:bg-red-500 text-red-500 hover:text-white py-2.5 rounded-xl text-sm font-bold transition-all border border-red-200 shadow-sm"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {modules.length === 0 && !error && (
                            <div className="col-span-full bg-white rounded-[2rem] p-16 text-center shadow-sm ring-1 ring-black/5">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">📚</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Aún no hay módulos</h3>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    Crea tu primer módulo para empezar a estructurar la ruta de aprendizaje de tus
                                    cursos.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </ManagementLayout>
    );
}
