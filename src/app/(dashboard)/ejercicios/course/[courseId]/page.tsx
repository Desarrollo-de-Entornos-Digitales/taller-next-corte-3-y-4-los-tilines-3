'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import CaminoPath from '@/components/camino/CaminoPath';
import {
    CourseLearningHub,
    getCourseLearningHub,
    getExerciseTypeLabel,
} from '@/app/(dashboard)/services/exerciseService';

const moduleColors = ['bg-[#E9539A]', 'bg-[#953DF1]', 'bg-[#FAD94C]', 'bg-[#37CDB2]'];

export default function CourseLearningPage() {
    const params = useParams();
    const courseId = Number(params.courseId);

    const [hub, setHub] = useState<CourseLearningHub | null>(null);
    const [userId, setUserId] = useState<number | undefined>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const raw = localStorage.getItem('user');
            if (raw) {
                try {
                    setUserId(Number(JSON.parse(raw).id));
                } catch {
                    setUserId(undefined);
                }
            }
        }
    }, []);

    useEffect(() => {
        if (!courseId || Number.isNaN(courseId)) {
            setError('ID de curso inválido');
            setLoading(false);
            return;
        }

        let mounted = true;

        (async () => {
            try {
                setLoading(true);
                const data = await getCourseLearningHub(courseId, userId);
                if (mounted) setHub(data);
            } catch (err: any) {
                if (mounted) {
                    setError(err.response?.data?.message ?? 'No se pudo cargar el contenido del curso.');
                }
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [courseId, userId]);

    const caminoNodes = useMemo(() => {
        if (!hub) return [];
        return hub.modules.map((module) => ({
            id: module.id,
            label: module.title,
            description: module.description,
            state: module.caminoState,
            progress: module.progress,
            meta: `${module.exercisesCompleted ?? 0}/${module.exerciseCount} ejercicios`,
            href:
                module.caminoState !== 'locked'
                    ? `/ejercicios/course/${courseId}/module/${module.id}`
                    : undefined,
        }));
    }, [hub, courseId]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <NavBar />

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
                <Link
                    href={`/courses/${courseId}`}
                    className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-6"
                >
                    ← Volver al curso
                </Link>

                {loading && (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-10 bg-gray-200 rounded w-1/2" />
                        <div className="h-48 bg-gray-200 rounded-3xl" />
                    </div>
                )}

                {error && !loading && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
                        {error}
                    </div>
                )}

                {!loading && hub && (
                    <div className="space-y-8">
                        <section className="rounded-3xl bg-white shadow-sm border border-gray-100 overflow-hidden">
                            <div className="h-32 bg-gradient-to-r from-[#1E3A8A] to-[#4A86F7]" />
                            <div className="p-8">
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                    El camino · Curso
                                </p>
                                <h1 className="text-3xl font-black text-gray-900 mt-1">{hub.course.name}</h1>
                                <p className="text-gray-600 mt-3 leading-relaxed whitespace-pre-wrap">
                                    {hub.course.description}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span className="badge badge-lg bg-blue-50 text-[#1E3A8A] border-none">
                                        {hub.modules.length} módulos
                                    </span>
                                    <span className="badge badge-lg bg-gray-100 text-gray-700 border-none">
                                        {hub.totalExercises} ejercicios
                                    </span>
                                    <span className="badge badge-lg bg-emerald-50 text-emerald-800 border-none">
                                        {hub.completedExercises} completados
                                    </span>
                                </div>
                            </div>
                        </section>

                        <CaminoPath
                            title="Mapa de aprendizaje"
                            subtitle="El camino"
                            description="Cada módulo desbloquea documentación y ejercicios tipo Arena. Los completados brillan; pulsa el nodo activo para continuar."
                            nodes={caminoNodes}
                            overallProgress={hub.overallProgress}
                            completedLabel="módulos"
                            activeLabel="activo"
                            lockedLabel="bloqueados"
                        />

                        <section>
                            <h2 className="text-xl font-black text-gray-900 mb-4">Detalle por módulo</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                {hub.modules.map((module, index) => (
                                    <article
                                        key={module.id}
                                        className={`card bg-white shadow-sm border overflow-hidden transition-shadow ${
                                            module.caminoState === 'locked'
                                                ? 'border-gray-100 opacity-70'
                                                : 'border-gray-100 hover:shadow-md'
                                        }`}
                                    >
                                        <figure
                                            className={`h-24 ${moduleColors[index % moduleColors.length]} flex items-center justify-center relative`}
                                        >
                                            <span className="text-white text-3xl font-black opacity-30">
                                                {module.level_order}
                                            </span>
                                            {module.status === 'completed' && (
                                                <span className="absolute top-3 right-3 bg-white/25 rounded-full p-2">
                                                    ✓
                                                </span>
                                            )}
                                        </figure>
                                        <div className="card-body p-6">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase text-gray-400">
                                                        Módulo {module.level_order}
                                                    </p>
                                                    <h3 className="text-lg font-black text-gray-900">{module.title}</h3>
                                                </div>
                                                <span className="badge badge-sm bg-gray-100 border-none">
                                                    {module.progress}%
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                                {module.description}
                                            </p>

                                            {module.exercises.length > 0 && (
                                                <ul className="mt-4 space-y-2">
                                                    {module.exercises.slice(0, 3).map((exercise) => (
                                                        <li
                                                            key={exercise.id}
                                                            className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 rounded-xl px-3 py-2"
                                                        >
                                                            <span className="font-medium truncate pr-2 flex items-center gap-2">
                                                                {exercise.completed && (
                                                                    <span className="text-emerald-500">✓</span>
                                                                )}
                                                                {exercise.title}
                                                            </span>
                                                            <span className="shrink-0 badge badge-xs bg-white border-gray-200">
                                                                {getExerciseTypeLabel(exercise.exercise_type)}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                            <div className="card-actions mt-4">
                                                {module.caminoState === 'locked' ? (
                                                    <button
                                                        disabled
                                                        className="btn btn-disabled btn-sm border-none"
                                                    >
                                                        Completa el módulo anterior
                                                    </button>
                                                ) : (
                                                    <Link
                                                        href={`/ejercicios/course/${courseId}/module/${module.id}`}
                                                        className="btn bg-[#4A86F7] hover:bg-blue-600 text-white border-none btn-sm"
                                                    >
                                                        {module.status === 'completed'
                                                            ? 'Repasar módulo'
                                                            : module.exerciseCount > 0
                                                              ? 'Entrar al módulo'
                                                              : 'Ver documentación'}
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
