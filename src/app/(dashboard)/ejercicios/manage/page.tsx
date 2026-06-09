'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getExercises, deleteExercise, Exercise } from '../../services/exerciseManageService';
import { moduleService, ModuleEntity } from '../../services/moduleService';
import ManagementLayout from '../../../../components/ManagementLayout';
import { toast } from '@/lib/zustand/toastStore';

export default function ManageExercisesPage() {
    const router = useRouter();
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [modules, setModules] = useState<ModuleEntity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const CARD_COLORS = ['bg-[#E94D8E]', 'bg-[#9B4DFF]', 'bg-[#FFD13B]', 'bg-[#34D399]', 'bg-[#4A86F7]'];
    const getColor = (index: number) => CARD_COLORS[index % CARD_COLORS.length];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [exData, modData] = await Promise.all([
                getExercises(),
                moduleService.getAll()
            ]);
            setExercises(exData);
            setModules(modData);
        } catch (err) {
            console.error(err);
            setError('Failed to load data.');
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('¿Estás seguro de que deseas eliminar este ejercicio?')) {
            try {
                await deleteExercise(id);
                await loadData();
                toast.success('Ejercicio eliminado con éxito');
            } catch (err: any) {
                console.error(err);
                if (err.response?.status === 500) {
                    toast.error('No se puede eliminar: el ejercicio ya tiene intentos de estudiantes.');
                } else {
                    toast.error('Error al eliminar el ejercicio.');
                }
            }
        }
    };

    const getDifficultyColor = (level: number) => {
        if (level === 1) return 'bg-[#E8F5E9] text-[#2E7D32]';
        if (level === 2) return 'bg-[#FFF8E1] text-[#F57F17]';
        return 'bg-[#FFEBEE] text-[#C62828]';
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            MULTIPLE_CHOICE: 'Selección Múltiple',
            CODING: 'Código',
            TRUE_FALSE: 'Verdadero/Falso',
        };
        return labels[type] || type;
    };

    return (
        <ManagementLayout>
            <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 py-8">
                <p className="text-sm font-bold text-gray-400 mb-6">Panel de control</p>
                <header className="mb-12 rounded-3xl bg-white px-8 py-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 mb-2">
                                Gestión de ejercicios
                            </h1>
                            <p className="text-sm font-medium text-gray-500">
                                Crea, edita y elimina los ejercicios en los módulos del grupo
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/ejercicios/manage/create')}
                            className="bg-[#3b82f6] hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all active:scale-95 shrink-0 flex items-center gap-2"
                        >
                            <span className="text-xl leading-none">+</span> Nuevo ejercicio
                        </button>
                    </div>
                </header>

                {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium">{error}</div>}

                {loading ? (
                    <div className="text-center py-20">
                        <span className="loading loading-spinner loading-lg text-[#3b82f6]"></span>
                    </div>
                ) : (
                    <div>
                        {modules.map((mod, modIndex) => {
                            const moduleExercises = exercises.filter((ex) => ex.module_id === mod.id);
                            if (moduleExercises.length === 0) return null;

                            return (
                                <div key={mod.id} className="mb-14">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 rounded-full border-2 border-blue-400 text-blue-500 flex items-center justify-center font-black text-xl shrink-0">
                                            {mod.level_order}
                                        </div>
                                        <h2 className="text-[28px] font-black text-black">
                                            Unidad {mod.level_order}: {mod.title}
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {moduleExercises.map((exercise) => (
                                            <div
                                                key={exercise.id}
                                                className="bg-white rounded-[1.5rem] border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col group hover:-translate-y-1 transition-transform duration-300"
                                            >
                                                <div className={`h-[180px] ${getColor(modIndex)} relative`} />

                                                <div className="p-8 flex flex-col flex-grow">
                                                    <h3 className="text-[20px] font-black text-black mb-2 line-clamp-1">
                                                        {exercise.title}
                                                    </h3>
                                                    <p className="text-[13px] text-gray-800 line-clamp-2 mb-8 font-medium italic">
                                                        {exercise.description}
                                                    </p>

                                                    <div className="flex gap-4 mt-auto">
                                                        <button
                                                            onClick={() => router.push(`/ejercicios/manage/edit/${exercise.id}`)}
                                                            className="flex-1 bg-white hover:bg-blue-50 text-[#3b82f6] py-3 rounded-2xl text-[13px] font-black transition-all border border-blue-100"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(exercise.id)}
                                                            className="flex-1 bg-white hover:bg-red-50 text-red-500 py-3 rounded-2xl text-[13px] font-black transition-all border border-red-100"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {exercises.length === 0 && !error && (
                            <div className="col-span-full bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Aún no hay ejercicios</h3>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    Crea tu primer ejercicio interactivo para poner a prueba a los estudiantes.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </ManagementLayout>
    );
}
