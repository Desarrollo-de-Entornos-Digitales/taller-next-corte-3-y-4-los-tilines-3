'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { courseService, Course } from '../../../services/courseService';
import { getProfessors, UserBrief } from '../../../services/userService';

export default function EditCoursePage() {
    const params = useParams();
    const router = useRouter();
    const { user, canManageCourses, isAdmin } = useAuth();

    const courseId = Number(params.id);

    const [course, setCourse] = useState<Course | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [professorId, setProfessorId] = useState<number | ''>('');
    const [professors, setProfessors] = useState<UserBrief[]>([]);
    const [professorsLoading, setProfessorsLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canEdit =
        canManageCourses &&
        course &&
        (isAdmin || course.professor_id === user?.id);

    useEffect(() => {
        if (!courseId || Number.isNaN(courseId)) {
            setError('Invalid course ID');
            setPageLoading(false);
            return;
        }

        let mounted = true;

        (async () => {
            try {
                setPageLoading(true);
                setError(null);
                const data = await courseService.getById(courseId);
                if (!mounted) return;

                setCourse(data);
                setName(data.name);
                setDescription(data.description ?? '');
                setProfessorId(data.professor_id);

                if (isAdmin) {
                    try {
                        setProfessorsLoading(true);
                        const list = await getProfessors();
                        if (mounted) setProfessors(list);
                    } catch {
                        // fallback to numeric input
                    } finally {
                        if (mounted) setProfessorsLoading(false);
                    }
                }
            } catch (err: any) {
                if (!mounted) return;
                setError(err.response?.data?.message ?? 'Could not load course.');
            } finally {
                if (mounted) setPageLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [courseId, isAdmin]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!course || !user) return;

        setError(null);
        if (!name.trim()) {
            setError('Name is required');
            return;
        }

        setSubmitLoading(true);
        try {
            const updateData: {
                name: string;
                description: string;
                professor_id?: number;
            } = {
                name: name.trim(),
                description: description.trim(),
            };

            if (isAdmin && professorId) {
                updateData.professor_id = Number(professorId);
            }

            await courseService.update(course.id, updateData, user.id);
            router.push(`/courses/${course.id}`);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? 'Failed to update course');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <NavBar />

            <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
                <Link
                    href={course ? `/courses/${course.id}` : '/courses'}
                    className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-6"
                >
                    ← Back to course
                </Link>

                {pageLoading && (
                    <div className="bg-white rounded-3xl shadow-sm p-8 animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/2" />
                        <div className="h-10 bg-gray-200 rounded" />
                        <div className="h-32 bg-gray-200 rounded" />
                    </div>
                )}

                {!pageLoading && !canManageCourses && (
                    <div className="bg-white rounded-3xl p-12 text-center">
                        <h3 className="text-xl font-bold">Access denied</h3>
                        <p className="text-gray-500 mt-2">You don&apos;t have permission to edit courses.</p>
                    </div>
                )}

                {!pageLoading && canManageCourses && course && !canEdit && (
                    <div className="bg-white rounded-3xl p-12 text-center">
                        <h3 className="text-xl font-bold">Access denied</h3>
                        <p className="text-gray-500 mt-2">
                            You can only edit courses assigned to you.
                        </p>
                    </div>
                )}

                {!pageLoading && canEdit && course && (
                    <div className="bg-white rounded-3xl shadow-sm p-8">
                        <div className="mb-6">
                            <h1 className="text-3xl font-black text-gray-900">Edit Course</h1>
                            <p className="text-gray-500 mt-1">Update course information.</p>
                        </div>

                        {error && (
                            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-4">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    placeholder="Course name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={6}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    placeholder="Short description (optional)"
                                />
                            </div>

                            {isAdmin && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Assign Professor
                                    </label>
                                    {professorsLoading ? (
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span className="loading loading-spinner loading-sm" />
                                            Loading professors...
                                        </div>
                                    ) : professors.length > 0 ? (
                                        <select
                                            value={professorId}
                                            onChange={(e) => setProfessorId(Number(e.target.value))}
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 text-gray-700"
                                        >
                                            {professors.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    #{p.id} - {p.username}
                                                    {p.email ? ` (${p.email})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <>
                                            <input
                                                value={professorId}
                                                onChange={(e) =>
                                                    setProfessorId(
                                                        e.target.value === '' ? '' : Number(e.target.value)
                                                    )
                                                }
                                                type="number"
                                                className="w-48 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                                placeholder="Professor ID"
                                            />
                                            <p className="text-xs text-gray-400 mt-1">
                                                Could not load professors list. Enter a valid professor_id.
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-3 justify-end">
                                <Link
                                    href={`/courses/${course.id}`}
                                    className="btn btn-ghost"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={submitLoading}
                                    className="btn bg-[#1E3A8A] hover:bg-blue-800 text-white border-none px-6 rounded-xl shadow-md"
                                >
                                    {submitLoading ? (
                                        <span className="loading loading-spinner loading-sm" />
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {!pageLoading && error && !course && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
                        {error}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
