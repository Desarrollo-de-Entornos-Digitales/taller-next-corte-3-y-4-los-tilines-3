// 3. src/app/(dashboard)/feed/page.tsx (Simplificado y Robusto)
'use client';

import { useEffect, useState } from 'react';

import { getFeedItems, FeedItem, FeedResponse, getPendingExercises, FeedExercise } from '../services/feedService';
import { getMyEnrollments, Enrollment } from '../services/courseService';
import Card from '../../../components/Card';
import NavBar from '../../../components/NavBar';
import Hero from '../../../components/Hero';
import Footer from '../../../components/Footer';

export default function FeedPage() {
    const [feedData, setFeedData] = useState<FeedResponse | null>(null);
    const [pendingExercises, setPendingExercises] = useState<FeedExercise[]>([]);
    const [courses, setCourses] = useState<Enrollment[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [username, setUsername] = useState('User');
    const [userRole, setUserRole] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const initDashboard = async () => {
            try {
                setLoading(true);
                const userStr = localStorage.getItem('user');

                let userId = 0;
                if (userStr) {
                    const user = JSON.parse(userStr);
                    setUsername(user.username || 'User');
                    setUserRole(user.roleName || '');
                    userId = user.id;
                }

                // 1. Intentar cargar cursos (pero no morir si falla)
                let enrollments: Enrollment[] = [];
                if (userId) {
                    try {
                        enrollments = await getMyEnrollments(userId);
                        setCourses(enrollments);
                    } catch (e) {
                        console.warn('No enrollments found for this user');
                    }
                }

                // 2. Cargar feed
                if (enrollments.length > 0) {
                    const firstCourseId = enrollments[0].course_id;
                    setSelectedCourseId(firstCourseId);
                    await loadFeed(1, firstCourseId);
                } else {
                    // Si no hay cursos inscritos (Admin o nuevo), cargar el feed por defecto del sistema
                    await loadFeed(1);
                }
            } catch (err) {
                console.error('Dashboard init error:', err);
                setError('Could not load your dashboard. Try logging in again.');
            } finally {
                setLoading(false);
            }
        };
        initDashboard();
    }, []);

    const loadFeed = async (page: number, courseId?: number) => {
        try {
            setLoading(true);
            const targetCourseId = courseId || selectedCourseId;
            const data = await getFeedItems(page, 3, targetCourseId || undefined);
            setFeedData(data);
            setCurrentPage(page);
            
            const cid = data.course_id || targetCourseId;
            if (cid) {
                const exercises = await getPendingExercises(cid);
                setPendingExercises(exercises);
                setSelectedCourseId(cid);
            }
        } catch (err) {
            setError('Error loading modules for this course.');
        } finally {
            setLoading(false);
        }
    };

    const handleCourseChange = (courseId: number) => {
        setSelectedCourseId(courseId);
        loadFeed(1, courseId);
    };

    // Filtros de UI (ya no usados, mantenidos por si acaso)
    const getItemsByStatus = (status: string) => feedData?.data.filter((item) => item.status === status) || [];

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />
            <Hero isDashboard={true} username={username} />

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Selector de Grupos Estilizado */}
                {courses.length > 0 && userRole !== 'estudiante' && userRole !== 'user' && (
                    <div className="mb-10 p-6 bg-white rounded-3xl shadow-sm border border-gray-100 flex gap-4 overflow-x-auto">
                        {courses.map((e) => (
                            <button
                                key={e.id}
                                onClick={() => handleCourseChange(e.course_id)}
                                className={`px-6 py-2 rounded-full font-bold transition-all ${
                                    selectedCourseId === e.course_id
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                            >
                                {e.courses.name}
                            </button>
                        ))}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-20">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                        <p className="mt-4 text-gray-400 italic">Fetching your progress...</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Sección: Pending (Unidades) */}
                        <Section
                            title="Pending"
                            color="bg-[#3b82f6]"
                            items={feedData?.data || []}
                            courseId={selectedCourseId ?? undefined}
                            gridCols="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                        />

                        {/* Sección: Ongoing (Ejercicios Disponibles) */}
                        <Section
                            title="Ongoing"
                            color="bg-[#3b82f6]"
                            items={pendingExercises}
                            courseId={selectedCourseId ?? undefined}
                            isExercises={true}
                            gridCols="grid-cols-1 md:grid-cols-2"
                        />

                        {/* CONTROLES DE PAGINACIÓN */}
                        {feedData && feedData.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-12 py-6 border-t border-gray-100">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => loadFeed(currentPage - 1)}
                                    className="btn btn-circle btn-outline border-gray-200 hover:bg-blue-600 hover:border-blue-600 disabled:opacity-30"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M15 19l-7-7 7-7"
                                        />
                                    </svg>
                                </button>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-gray-400">Página</span>
                                    <span className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm shadow-lg shadow-blue-200">
                                        {currentPage}
                                    </span>
                                    <span className="text-sm font-bold text-gray-400">de {feedData.totalPages}</span>
                                </div>

                                <button
                                    disabled={currentPage === feedData.totalPages}
                                    onClick={() => loadFeed(currentPage + 1)}
                                    className="btn btn-circle btn-outline border-gray-200 hover:bg-blue-600 hover:border-blue-600 disabled:opacity-30"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}

// Componente Interno para las secciones
function Section({
    title,
    color,
    items,
    courseId,
    isExercises = false,
    gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
}: {
    title: string;
    color: string;
    items: any[];
    courseId?: number;
    isExercises?: boolean;
    gridCols?: string;
}) {
    return (
        <section>
            <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            </div>
            {items.length > 0 ? (
                <div className={`grid ${gridCols} gap-6`}>
                    {items.map((item) => {
                        if (isExercises) {
                            const ex = item as any;
                            const feedItem: FeedItem = {
                                id: ex.id,
                                title: `Unit ${ex.level_order || ex.id} - Ex ${ex.id}`,
                                description: `${ex.points} puntos - Dificultad Nivel ${ex.difficulty_level}`,
                                status: 'in_progress',
                                progress: 0 // hardcoded to match the visual 0% indicator
                            };
                            return <Card key={ex.id} item={feedItem} courseId={courseId} href={`/arena/${ex.id}`} />;
                        } else {
                            const mod = item as any;
                            const modItem: FeedItem = {
                                id: mod.id,
                                title: `Unit ${mod.level_order || mod.id}`,
                                description: mod.description,
                                progress: mod.progress || 0,
                                status: 'pending', // Pending unit styling
                            }
                            return <Card key={mod.id} item={modItem} courseId={courseId} />;
                        }
                    })}
                </div>
            ) : (
                <p className="text-gray-400 italic bg-white p-8 rounded-2xl border-2 border-dashed border-gray-100 text-center">
                    Nothing here yet!
                </p>
            )}
        </section>
    );
}
