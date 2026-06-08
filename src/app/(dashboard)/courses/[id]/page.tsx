'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';

import { courseService, Course } from '../../services/courseService';
import { getProfessors, UserBrief } from '../../services/userService';

function formatDate(iso: string) {
    try {
        return new Date(iso).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch {
        return iso;
    }
}

export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, canManageCourses, isAdmin } = useAuth();

    const courseId = Number(params.id);

    const [course, setCourse] = useState<Course | null>(null);
    const [professor, setProfessor] = useState<UserBrief | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const canEdit = canManageCourses && course && (isAdmin || course.professor_id === user?.id);

    useEffect(() => {
        if (!courseId || Number.isNaN(courseId)) {
            setError('Invalid course ID');
            setLoading(false);
            return;
        }

        let mounted = true;

        (async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await courseService.getById(courseId);
                if (!mounted) return;
                setCourse(data);

                try {
                    const professors = await getProfessors();
                    const match = professors.find((p) => p.id === data.professor_id);
                    if (match) setProfessor(match);
                } catch {
                    // professor name is optional
                }
            } catch (err: any) {
                if (!mounted) return;
                setError(err.response?.data?.message ?? 'Could not load course.');
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [courseId]);

    const handleDelete = async () => {
        if (!course) return;
        try {
            setDeleteLoading(true);
            await courseService.remove(course.id, course.professor_id);
            router.push('/courses');
        } catch (err: any) {
            setError(err.response?.data?.message ?? 'Error deleting course.');
            setShowDeleteConfirm(false);
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <NavBar />

            <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
                <Link
                    href="/courses"
                    className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-6"
                >
                    ← Back to courses
                </Link>

                {loading && (
                    <div className="bg-white rounded-3xl shadow-sm p-8 animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-2/3" />
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-5/6" />
                    </div>
                )}

                {error && !loading && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">{error}</div>
                )}

                {!loading && course && (
                    <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
                        <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-700" />

                        <div className="p-8">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                                <div>
                                    <h1 className="text-3xl font-black text-gray-900">{course.name}</h1>
                                    <p className="text-gray-500 mt-1">Created {formatDate(course.created_at)}</p>
                                </div>

                                {canEdit && (
                                    <div className="flex gap-2 shrink-0">
                                        <Link
                                            href={`/courses/${course.id}/edit`}
                                            className="btn btn-outline border-gray-300 hover:border-blue-500 hover:text-blue-600"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="btn bg-red-500 hover:bg-red-600 text-white border-none"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <section>
                                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-2">
                                        Description
                                    </h2>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {course.description || 'No description provided.'}
                                    </p>
                                </section>

                                <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
                                            Professor
                                        </p>
                                        <p className="font-semibold text-gray-900">
                                            {professor
                                                ? `${professor.username}${professor.email ? ` (${professor.email})` : ''}`
                                                : `User #${course.professor_id}`}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
                                            Course ID
                                        </p>
                                        <p className="font-semibold text-gray-900">#{course.id}</p>
                                    </div>
                                </section>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Link
                                        href={`/ejercicios/course/${course.id}`}
                                        className="btn bg-[#1E3A8A] hover:bg-blue-800 text-white border-none w-full sm:w-auto"
                                    >
                                        Explorar módulos y ejercicios
                                    </Link>
                                    <Link
                                        href={`/feed?courseId=${course.id}`}
                                        className="btn btn-outline border-gray-300 w-full sm:w-auto"
                                    >
                                        Ver en Feed
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {showDeleteConfirm && course && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Course</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete{' '}
                            <span className="font-semibold text-gray-900">&quot;{course.name}&quot;</span>? This action
                            cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={deleteLoading}
                                className="btn btn-ghost"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteLoading}
                                className="btn bg-red-500 hover:bg-red-600 text-white border-none"
                            >
                                {deleteLoading ? <span className="loading loading-spinner loading-sm" /> : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
