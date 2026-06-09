'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

import { moduleService, UpdateModuleDto } from '../../../services/moduleService';
import { courseService, Course } from '../../../services/courseService';
import NavBar from '../../../../../components/NavBar';
import Footer from '../../../../../components/Footer';

export default function EditModulePage() {
    const router = useRouter();
    const params = useParams();
    const id = Number(params.id);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);

    const [formData, setFormData] = useState<UpdateModuleDto>({
        title: '',
        description: '',
        level_order: 1,
        course_id: 0,
    });

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch courses and module details in parallel
                const [coursesData, moduleData] = await Promise.all([
                    courseService.getAll(),
                    moduleService.getById(id),
                ]);

                setCourses(coursesData);
                setFormData({
                    title: moduleData.title,
                    description: moduleData.description,
                    level_order: moduleData.level_order,
                    course_id: moduleData.course_id,
                });
            } catch (err) {
                console.error('Failed to load data', err);
                setError('Error al cargar la información del módulo.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'level_order' || name === 'course_id' ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            if (!formData.course_id) {
                throw new Error('Debe seleccionar un curso válido.');
            }
            await moduleService.update(id, formData);
            router.push('/modules/manage');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || err.message || 'Error al actualizar el módulo');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <NavBar />
                <div className="flex-1 flex items-center justify-center w-full">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <NavBar />

            <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
                <header className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="text-gray-500 hover:text-gray-900 flex items-center gap-2 mb-4 font-bold text-sm transition-colors"
                    >
                        ← Volver a Gestión
                    </button>
                    <h1 className="text-3xl font-extrabold text-gray-900">Editar Módulo #{id}</h1>
                </header>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-[2rem] shadow-sm ring-1 ring-black/5 p-8 space-y-6"
                >
                    {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium">{error}</div>}

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Título del Módulo</label>
                            <input
                                required
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>

                        {/* Curso Dropdown */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Grupo Asociado</label>
                            <select
                                name="course_id"
                                value={formData.course_id}
                                onChange={handleChange}
                                disabled={loading || saving}
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-pink-500 focus:bg-white transition-colors text-gray-700 appearance-none font-medium"
                            >
                                {courses.length === 0 && <option value={0}>Cargando grupos...</option>}
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Orden del Módulo (Nivel)
                            </label>
                            <input
                                required
                                type="number"
                                min="1"
                                name="level_order"
                                value={formData.level_order}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Descripción</label>
                            <textarea
                                required
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving || courses.length === 0}
                            className="bg-[#4A86F7] hover:bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
                        >
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </main>

            <Footer />
        </div>
    );
}
