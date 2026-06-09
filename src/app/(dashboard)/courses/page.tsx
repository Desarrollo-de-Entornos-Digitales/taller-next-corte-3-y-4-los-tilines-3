'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import ManagementLayout from '@/components/ManagementLayout';
import { useAuth } from '@/context/AuthContext';

import { courseService, Course, getMyEnrollments, joinGroup } from '../services/courseService';

// ─── palette helpers ─────────────────────────────────────────────────────────
const CARD_COLORS = ['bg-[#FFEBEE]', 'bg-[#F3E5F5]', 'bg-[#FFF8E1]', 'bg-[#E0F2F1]', 'bg-[#E3F2FD]', 'bg-[#FFF3E0]'];
const colorFor = (index: number) => CARD_COLORS[index % CARD_COLORS.length];

// ─── Delete confirmation modal ────────────────────────────────────────────────
function DeleteModal({
    course,
    onConfirm,
    onCancel,
    loading,
}: {
    course: Course;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Grupo</h3>
                <p className="text-gray-600 mb-6">
                    Are you sure you want to delete <span className="font-semibold text-gray-900">"{course.name}"</span>
                    ? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                    <button onClick={onCancel} disabled={loading} className="btn btn-ghost">
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="btn bg-red-500 hover:bg-red-600 text-white border-none"
                    >
                        {loading ? <span className="loading loading-spinner loading-sm" /> : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Join group modal ────────────────────────────────────────────────────────
function JoinModal({
    onConfirm,
    onCancel,
    loading,
}: {
    onConfirm: (code: string) => void;
    onCancel: () => void;
    loading: boolean;
}) {
    const [code, setCode] = useState('');
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Unirse a un Grupo</h3>
                <p className="text-gray-600 mb-6">
                    Pídele el código de acceso a tu profesor e ingrésalo aquí.
                </p>
                <input
                    type="text"
                    placeholder="Ej. GRP-5"
                    className="input input-bordered w-full mb-6 font-mono uppercase"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                />
                <div className="flex gap-3 justify-end">
                    <button onClick={onCancel} disabled={loading} className="btn btn-ghost">
                        Cancelar
                    </button>
                    <button
                        onClick={() => onConfirm(code)}
                        disabled={loading || !code.trim()}
                        className="btn bg-[#3b82f6] hover:bg-blue-600 text-white border-none"
                    >
                        {loading ? <span className="loading loading-spinner loading-sm" /> : 'Unirse'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Group card ──────────────────────────────────────────────────────────────
function GroupCard({
    course,
    canManage,
    onDelete,
    index,
}: {
    course: Course;
    canManage: boolean;
    onDelete: (course: Course) => void;
    index: number;
}) {
    const headerColor = colorFor(course.id || index);

    return (
        <div className="bg-white rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-100 overflow-hidden relative group">
            {/* Top color bar */}
            <div className={`h-3 w-full ${headerColor}`} />
            
            <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-14 h-14 rounded-full bg-blue-50/50 text-[#4A86F7] flex items-center justify-center font-black text-2xl shadow-sm ring-4 ring-white">
                        {course.name.charAt(0).toUpperCase()}
                    </div>
                    {canManage && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link
                                href={`/courses/${course.id}/edit`}
                                className="btn btn-circle btn-sm btn-ghost text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                title="Editar Grupo"
                            >
                                ✏️
                            </Link>
                            <button
                                onClick={() => onDelete(course)}
                                className="btn btn-circle btn-sm btn-ghost text-gray-400 hover:text-red-500 hover:bg-red-50"
                                title="Eliminar Grupo"
                            >
                                🗑️
                            </button>
                        </div>
                    )}
                </div>

                <h3 className="text-2xl font-black text-gray-900 mb-2">{course.name}</h3>
                
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3 font-semibold bg-gray-50 w-fit px-3 py-1.5 rounded-lg border border-gray-100">
                    <span>👨‍🏫</span>
                    <span>Profesor Asignado: #{course.professor_id}</span>
                </div>
                
                {canManage && (
                    <div className="flex items-center gap-2 text-sm text-[#4A86F7] mb-4 font-bold bg-[#4A86F7]/10 px-4 py-2 rounded-xl justify-center border border-[#4A86F7]/20">
                        Código de acceso: GRP-{course.id}
                    </div>
                )}

                <p className="text-sm text-gray-500 leading-relaxed mb-8 flex-1 line-clamp-3">
                    {course.description || "Sin descripción proporcionada para este grupo."}
                </p>

                <div className="mt-auto">
                    {canManage ? (
                        <Link
                            href={`/courses/${course.id}`}
                            className="btn w-full bg-[#4A86F7] hover:bg-blue-600 text-white border-none rounded-2xl font-bold h-12 shadow-[0_4px_14px_0_rgba(74,134,247,0.39)] hover:shadow-[0_6px_20px_rgba(74,134,247,0.23)] hover:-translate-y-0.5 transition-all"
                        >
                            Administrar Grupo
                        </Link>
                    ) : (
                        <Link
                            href={`/courses/${course.id}`}
                            className="btn w-full bg-[#4A86F7] hover:bg-blue-600 text-white border-none rounded-2xl font-bold h-12 shadow-[0_4px_14px_0_rgba(74,134,247,0.39)] hover:shadow-[0_6px_20px_rgba(74,134,247,0.23)] hover:-translate-y-0.5 transition-all"
                        >
                            Entrar al Grupo
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CoursesPage() {
    const { user, canManageCourses } = useAuth();
    const [storedCanManageCourses, setStoredCanManageCourses] = useState(false);

    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [toDelete, setToDelete] = useState<Course | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 6;
    const totalPages = Math.ceil(courses.length / PAGE_SIZE);
    const paginated = courses.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinLoading, setJoinLoading] = useState(false);

    const canManage = canManageCourses || storedCanManageCourses;

    const fetchCourses = async () => {
        if (!user?.id) return;
        try {
            setLoading(true);
            setError(null);
            if (canManage) {
                const data = await courseService.getAll();
                const roleName = String(user.roleName ?? '').toLowerCase();
                if (roleName === 'professor' || roleName === 'profesor') {
                    setCourses(data.filter(c => c.professor_id === user.id));
                } else {
                    setCourses(data);
                }
            } else {
                const enrollments: any[] = await getMyEnrollments(user.id);
                setCourses(enrollments.map(e => e.courses || e.course || e));
            }
        } catch (err: any) {
            setError(err.response?.data?.message ?? 'Failed to load grupos. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id !== undefined) {
            fetchCourses();
        }
    }, [user?.id, canManage]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return;

        try {
            const parsedUser = JSON.parse(storedUser);
            const roleName = String(
                parsedUser?.roleName ?? parsedUser?.role ?? parsedUser?.role_name ?? '',
            ).toLowerCase();
            setStoredCanManageCourses(roleName === 'admin' || roleName === 'professor' || roleName === 'profesor');
        } catch {
            setStoredCanManageCourses(false);
        }
    }, []);

    const handleDelete = async () => {
        if (!toDelete) return;
        try {
            setDeleteLoading(true);
            await courseService.remove(toDelete.id, toDelete.professor_id);
            setSuccessMsg(`Grupo "${toDelete.name}" deleted successfully.`);
            setToDelete(null);
            fetchCourses();
            setTimeout(() => setSuccessMsg(null), 4000);
        } catch (err: any) {
            setError(err.response?.data?.message ?? 'Error deleting grupo.');
            setToDelete(null);
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleJoinGroup = async (code: string) => {
        if (!user?.id) return;

        if (!canManage && courses.length >= 1) {
            setError('Ya estás inscrito en un grupo. Solo puedes pertenecer a un (1) grupo.');
            setShowJoinModal(false);
            return;
        }

        try {
            setJoinLoading(true);
            const courseIdMatch = code.match(/GRP-(\d+)/i);
            if (!courseIdMatch) {
                setError('Código inválido. Debe tener el formato GRP-X');
                return;
            }
            const courseId = parseInt(courseIdMatch[1], 10);
            await joinGroup(courseId, user.id);
            setSuccessMsg(`Te has unido al grupo exitosamente.`);
            setShowJoinModal(false);
            fetchCourses();
            setTimeout(() => setSuccessMsg(null), 4000);
        } catch (err: any) {
            setError(err.response?.data?.message ?? 'Error al unirte al grupo. Verifica el código.');
        } finally {
            setJoinLoading(false);
        }
    };

    return (
        <ManagementLayout>
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
                    <div>
                        <p className="text-sm font-bold text-[#4A86F7] uppercase tracking-wider mb-2">Algoritmos y Programación</p>
                        <h1 className="text-4xl font-black text-gray-900 mb-3">
                            {canManage ? 'Tus Grupos Creados' : 'Tu Grupo de Clase'}
                        </h1>
                        <p className="text-gray-500 font-medium text-lg">
                            {canManage 
                                ? `Tienes ${courses.length} grupos a tu cargo actualmente.` 
                                : courses.length > 0 
                                    ? `Este es tu grupo asignado. Haz clic en "Entrar al Grupo" para comenzar a aprender.` 
                                    : `Aún no perteneces a ningún grupo. Pídele el código de acceso a tu profesor.`}
                        </p>
                    </div>
                    {canManage ? (
                        <Link
                            href="/courses/create"
                            className="btn bg-[#3b82f6] hover:bg-blue-600 text-white border-none px-6 rounded-xl shadow-md"
                        >
                            + New Grupo
                        </Link>
                    ) : (
                        courses.length === 0 && (
                            <button
                                onClick={() => setShowJoinModal(true)}
                                className="btn bg-[#3b82f6] hover:bg-blue-600 text-white border-none px-6 rounded-xl shadow-md"
                            >
                                + Unirse a Grupo
                            </button>
                        )
                    )}
                </div>

                {/* Success banner */}
                {successMsg && (
                    <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
                        <span>✅</span> {successMsg}
                    </div>
                )}

                {/* Error banner */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center justify-between">
                        <span>⚠️ {error}</span>
                        <button
                            onClick={() => setError(null)}
                            className="text-red-400 hover:text-red-600 font-bold ml-4"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Loading skeleton */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                                <div className="h-36 bg-gray-200" />
                                <div className="p-5 space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    <div className="h-3 bg-gray-200 rounded w-full" />
                                    <div className="h-3 bg-gray-200 rounded w-5/6" />
                                    <div className="h-8 bg-gray-200 rounded-lg mt-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Courses grid */}
                {!loading && courses.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginated.map((course, idx) => (
                                <GroupCard
                                    key={course.id}
                                    course={course}
                                    canManage={canManage}
                                    onDelete={setToDelete}
                                    index={idx}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-12">
                                <div className="join shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="join-item btn btn-sm btn-outline border-0"
                                    >
                                        «
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setCurrentPage(p)}
                                            className={`join-item btn btn-sm ${p === currentPage ? 'btn-primary text-white' : 'btn-outline border-0'}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="join-item btn btn-sm btn-outline border-0"
                                    >
                                        »
                                    </button>
                                </div>
                                <span className="text-sm text-gray-500 ml-3">
                                    Page {currentPage} of {totalPages}
                                </span>
                            </div>
                        )}
                    </>
                )}

                {/* Empty state */}
                {!loading && courses.length === 0 && !error && (
                    <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-gray-200 shadow-sm">
                        <div className="text-7xl mb-6">🏫</div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">
                            {canManage ? 'Aún no hay grupos' : 'No perteneces a ningún grupo'}
                        </h3>
                        <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
                            {canManage
                                ? 'Crea el primer grupo de la clase para invitar a tus estudiantes y empezar a enseñar.'
                                : 'Para ver el contenido de Algoritmos y Programación, necesitas unirte al grupo de tu clase usando el código que te proporcionó tu profesor.'}
                        </p>
                        {canManage ? (
                            <Link href="/courses/create" className="btn bg-[#3b82f6] hover:bg-blue-600 text-white border-none px-8">
                                Create First Grupo
                            </Link>
                        ) : (
                            courses.length === 0 && (
                                <button onClick={() => setShowJoinModal(true)} className="btn bg-[#4A86F7] hover:bg-blue-600 text-white border-none px-8 rounded-2xl h-14 text-lg font-bold shadow-[0_4px_14px_0_rgba(74,134,247,0.39)] hover:shadow-[0_6px_20px_rgba(74,134,247,0.23)] hover:-translate-y-0.5 transition-all">
                                    + Ingresar Código de Acceso
                                </button>
                            )
                        )}
                    </div>
                )}
            </main>

            {/* Delete confirmation modal */}
            {toDelete && (
                <DeleteModal
                    course={toDelete}
                    onConfirm={handleDelete}
                    onCancel={() => setToDelete(null)}
                    loading={deleteLoading}
                />
            )}
            {/* Join group modal */}
            {showJoinModal && (
                <JoinModal
                    onConfirm={handleJoinGroup}
                    onCancel={() => setShowJoinModal(false)}
                    loading={joinLoading}
                />
            )}
        </ManagementLayout>
    );
}
