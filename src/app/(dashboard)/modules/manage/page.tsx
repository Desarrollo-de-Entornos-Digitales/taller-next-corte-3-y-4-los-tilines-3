'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { moduleService, ModuleEntity } from '../../services/moduleService';
import ManagementLayout from '../../../../components/ManagementLayout';
import { toast } from '@/lib/zustand/toastStore';

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
            toast.error('Error al cargar módulos');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('¿Estás seguro de que deseas eliminar este módulo?')) {
            try {
                await moduleService.remove(id);
                await loadModules();
                toast.success('Módulo eliminado con éxito');
            } catch (err: any) {
                console.error(err);
                if (err.response?.status === 500) {
                    toast.error('No se puede eliminar: el módulo contiene ejercicios.');
                } else {
                    toast.error('Error al eliminar el módulo');
                }
            }
        }
    };

    return (
        <ManagementLayout>
            <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 py-8">
                <p className="text-sm font-bold text-gray-400 mb-6">Panel de control</p>
                <header className="mb-12 rounded-3xl bg-white px-8 py-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 mb-2">
                                Gestión de módulos
                            </h1>
                            <p className="text-sm font-medium text-gray-500">
                                Administra los módulos de aprendizaje. Puedes asignar ejercicios a cada módulo posteriormente.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/modules/create')}
                            className="bg-[#3b82f6] hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all active:scale-95 shrink-0 flex items-center gap-2"
                        >
                            <span className="text-xl leading-none">+</span> Nuevo módulo
                        </button>
                    </div>
                </header>

                {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium">{error}</div>}

                {loading ? (
                    <div className="text-center py-20">
                        <span className="loading loading-spinner loading-lg text-[#3b82f6]"></span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {modules.map((mod, index) => (
                            <div
                                key={mod.id}
                                className="bg-white rounded-3xl border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col group hover:-translate-y-1 transition-transform duration-300"
                            >
                                <div className={`h-40 ${getColor(index)} relative p-6 flex flex-col justify-between`}>
                                    <div className="flex justify-between items-start">
                                        <div className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                                            Nivel {mod.level_order}
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-white mt-auto truncate drop-shadow-sm">
                                        {mod.title}
                                    </h3>
                                </div>
                                
                                <div className="p-6 flex flex-col flex-grow">
                                    <h4 className="text-lg font-black text-gray-900 mb-1">{mod.title}</h4>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-6 font-medium italic">
                                        {mod.description}
                                    </p>

                                    <div className="flex gap-4 mt-auto">
                                        <button
                                            onClick={() => router.push(`/modules/edit/${mod.id}`)}
                                            className="flex-1 bg-white hover:bg-blue-50 text-[#3b82f6] py-2.5 rounded-2xl text-sm font-black transition-all border border-blue-100"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(mod.id)}
                                            className="flex-1 bg-white hover:bg-red-50 text-red-500 py-2.5 rounded-2xl text-sm font-black transition-all border border-red-100"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {modules.length === 0 && !error && (
                            <div className="col-span-full bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
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
