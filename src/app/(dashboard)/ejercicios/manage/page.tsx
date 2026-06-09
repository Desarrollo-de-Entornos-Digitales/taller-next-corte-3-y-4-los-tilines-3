'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getExercises, deleteExercise, Exercise } from '../../services/exerciseManageService';
import { moduleService, ModuleEntity } from '../../services/moduleService';
import ManagementLayout from '../../../../components/ManagementLayout';

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
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this exercise?')) {
            try {
                await deleteExercise(id);
                await loadData();
            } catch (err) {
                console.error(err);
                alert('Failed to delete exercise');
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
            <main className="max-w-7xl mx-auto px-6 py-8 w-full">
                <header className="mb-8 rounded-[2rem] bg-white px-8 py-6 shadow-sm ring-1 ring-black/5">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Panel Docente</p>
                            <h1 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl text-gray-900">
                                Gestión de Ejercicios
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm text-zinc-600">
                                Crea, edita y elimina los ejercicios disponibles en los módulos del grupo.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/ejercicios/manage/create')}
                            className="bg-[#4A86F7] hover:bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-md transition-all active:scale-95"
                        >
                            + Nuevo Ejercicio
                        </button>
                    </div>
                </header>

                {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium">{error}</div>}

                {loading ? (
                    <div className="text-center py-20">
                        <span className="loading loading-spinner loading-lg text-[#4A86F7]"></span>
                    </div>
                ) : (
                    <div>
                        {modules.map((mod, modIndex) => {
                            const moduleExercises = exercises.filter((ex) => ex.module_id === mod.id);
                            if (moduleExercises.length === 0) return null;

                            return (
                                <div key={mod.id} className="mb-14">
                                    <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                        <span className="bg-[#E3F2FD] text-[#1976D2] w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-inner">
                                            {mod.level_order}
                                        </span>
                                        Módulo: {mod.title}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {moduleExercises.map((exercise) => (
                                            <div
                                                key={exercise.id}
                                                className="bg-white rounded-[1.5rem] shadow-[0_4px_24px_-8px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col justify-between group hover:-translate-y-1 transition-transform duration-300"
                                            >
                                                <div className={`h-40 ${getColor(modIndex)} relative`}>
                                                    <div className="absolute top-4 right-4 bg-white/25 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm shadow-sm flex items-center gap-1">
                                                        <span>🎯 pts:</span> {exercise.points}
                                                    </div>
                                                    <div className="absolute top-4 left-4 bg-black/10 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm shadow-sm">
                                                        {getTypeLabel(exercise.exercise_type)}
                                                    </div>
                                                </div>

                                                <div className="p-6 flex flex-col flex-grow">
                                                    <h3 className="text-xl font-extrabold text-gray-900 mb-2 group-hover:text-[#4A86F7] transition-colors line-clamp-1">
                                                        {exercise.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 line-clamp-2 mb-6 font-medium">
                                                        {exercise.description}
                                                    </p>

                                                    <div className="flex gap-2 mt-auto">
                                                        <button
                                                            onClick={() => router.push(`/ejercicios/manage/edit/${exercise.id}`)}
                                                            className="flex-1 bg-white hover:bg-[#4A86F7] text-[#4A86F7] hover:text-white py-2.5 rounded-xl text-sm font-bold transition-all border border-blue-200 shadow-sm"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(exercise.id)}
                                                            className="flex-1 bg-white hover:bg-red-500 text-red-500 hover:text-white py-2.5 rounded-xl text-sm font-bold transition-all border border-red-200 shadow-sm"
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

                        {/* Uncategorized / Orphan exercises just in case */}
                        {(() => {
                            const orphanExercises = exercises.filter((ex) => !modules.find((m) => m.id === ex.module_id));
                            if (orphanExercises.length === 0) return null;
                            return (
                                <div className="mb-14">
                                    <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                        <span className="bg-gray-200 text-gray-600 w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-inner">
                                            ?
                                        </span>
                                        Sin Módulo
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {orphanExercises.map((exercise) => (
                                            <div
                                                key={exercise.id}
                                                className="bg-white rounded-[1.5rem] shadow-[0_4px_24px_-8px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col justify-between group hover:-translate-y-1 transition-transform duration-300"
                                            >
                                                <div className={`h-40 bg-gray-400 relative`}>
                                                    <div className="absolute top-4 right-4 bg-white/25 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm shadow-sm flex items-center gap-1">
                                                        <span>🎯 pts:</span> {exercise.points}
                                                    </div>
                                                    <div className="absolute top-4 left-4 bg-black/10 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm shadow-sm">
                                                        {getTypeLabel(exercise.exercise_type)}
                                                    </div>
                                                </div>

                                                <div className="p-6 flex flex-col flex-grow">
                                                    <h3 className="text-xl font-extrabold text-gray-900 mb-2 group-hover:text-[#4A86F7] transition-colors line-clamp-1">
                                                        {exercise.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 line-clamp-2 mb-6 font-medium">
                                                        {exercise.description}
                                                    </p>

                                                    <div className="flex gap-2 mt-auto">
                                                        <button
                                                            onClick={() => router.push(`/ejercicios/manage/edit/${exercise.id}`)}
                                                            className="flex-1 bg-white hover:bg-[#4A86F7] text-[#4A86F7] hover:text-white py-2.5 rounded-xl text-sm font-bold transition-all border border-blue-200 shadow-sm"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(exercise.id)}
                                                            className="flex-1 bg-white hover:bg-red-500 text-red-500 hover:text-white py-2.5 rounded-xl text-sm font-bold transition-all border border-red-200 shadow-sm"
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
                        })()}

                        {exercises.length === 0 && !error && (
                            <div className="col-span-full bg-white rounded-[2rem] p-16 text-center shadow-sm ring-1 ring-black/5">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">📝</span>
                                </div>
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
