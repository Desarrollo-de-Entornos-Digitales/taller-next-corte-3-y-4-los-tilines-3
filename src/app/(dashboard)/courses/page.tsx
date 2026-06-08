'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import ManagementLayout from '@/components/ManagementLayout';
import { useAuth } from '@/context/AuthContext';

import { courseService, Course } from '../services/courseService';

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
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Course</h3>
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

// ─── Course card ──────────────────────────────────────────────────────────────
function CourseCard({
    course,
    colorClass,
    canManage,
    onDelete,
}: {
    course: Course;
    colorClass: string;
    canManage: boolean;
    onDelete: (course: Course) => void;
}) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col">
            {/* Color header */}
            <div className={`h-36 ${colorClass}`} />

            <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{course.name}</h3>
                <p className="text-sm text-gray-500 italic mb-4 line-clamp-2 flex-1">{course.description}</p>

                <div className="flex gap-2 mt-auto">
                    <Link
                        href={`/courses/${course.id}`}
                        className="btn btn-primary bg-blue-500 border-none hover:bg-blue-600 text-white flex-1 text-sm"
                    >
                        View Course
                    </Link>
                    {canManage && (
                        <>
                            <Link
                                href={`/courses/${course.id}/edit`}
                                className="btn btn-outline btn-sm border-gray-300 hover:border-blue-500 hover:text-blue-600"
                                title="Edit"
                            >
                                ✏️
                            </Link>
                            <button
                                onClick={() => onDelete(course)}
                                className="btn btn-outline btn-sm border-gray-300 hover:border-red-400 hover:text-red-500"
                                title="Delete"
                            >
                                🗑️
                            </button>
                        </>
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

    const fetchCourses = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await courseService.getAll();
            setCourses(data);
        } catch (err: any) {
            setError(err.response?.data?.message ?? 'Failed to load courses. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

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

    const canManage = canManageCourses || storedCanManageCourses;

    const handleDelete = async () => {
        if (!toDelete) return;
        try {
            setDeleteLoading(true);
            await courseService.remove(toDelete.id, toDelete.professor_id);
            setSuccessMsg(`Course "${toDelete.name}" deleted successfully.`);
            setToDelete(null);
            fetchCourses();
            setTimeout(() => setSuccessMsg(null), 4000);
        } catch (err: any) {
            setError(err.response?.data?.message ?? 'Error deleting course.');
            setToDelete(null);
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <ManagementLayout>
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900">Courses</h1>
                        <p className="text-gray-500 mt-1">Explore all available learning paths.</p>
                    </div>
                    {canManage && (
                        <Link
                            href="/courses/create"
                            className="btn bg-[#1E3A8A] hover:bg-blue-800 text-white border-none px-6 rounded-xl shadow-md"
                        >
                            + New Course
                        </Link>
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {paginated.map((course, idx) => (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    colorClass={colorFor((currentPage - 1) * PAGE_SIZE + idx)}
                                    canManage={canManage}
                                    onDelete={setToDelete}
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
                    <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-2xl font-bold text-gray-800">No courses yet</h3>
                        <p className="text-gray-500 mt-2 mb-6">
                            {canManage
                                ? 'Create the first course to get started!'
                                : 'Check back later for available courses.'}
                        </p>
                        {canManage && (
                            <Link href="/courses/create" className="btn bg-[#1E3A8A] text-white border-none px-8">
                                Create First Course
                            </Link>
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
        </ManagementLayout>
    );
}
