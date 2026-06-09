'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { createExercise, CreateExerciseDto, createExerciseOption } from '../../../services/exerciseManageService';
import { moduleService, ModuleEntity } from '../../../services/moduleService';
import { courseService, Course } from '../../../services/courseService';
import NavBar from '../../../../../components/NavBar';
import Footer from '../../../../../components/Footer';

export default function CreateExercisePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [modules, setModules] = useState<ModuleEntity[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<number>(0);

    // Options state for Multiple Choice
    const [options, setOptions] = useState<{ text: string; isCorrect: boolean }[]>([
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
    ]);

    const [formData, setFormData] = useState<CreateExerciseDto>({
        module_id: 1, // Default module id, user should select it
        title: '',
        description: '',
        exercise_type: 'MULTIPLE_CHOICE',
        difficulty_level: 1,
        points: 10,
        explanation: '',
        starterCode: '',
        solutionCode: '',
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const coursesData = await courseService.getAll();
                setCourses(coursesData);
                if (coursesData.length > 0) {
                    const firstCourseId = coursesData[0].id;
                    setSelectedCourseId(firstCourseId);
                }
            } catch (err) {
                console.error('Failed to load courses', err);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (!selectedCourseId) return;

        const fetchModulesForCourse = async () => {
            try {
                const modulesData = await moduleService.getByCourseId(selectedCourseId);
                setModules(modulesData);
                if (modulesData.length > 0) {
                    setFormData((prev) => ({ ...prev, module_id: modulesData[0].id }));
                } else {
                    setFormData((prev) => ({ ...prev, module_id: 0 }));
                }
            } catch (err) {
                console.error('Failed to load modules', err);
            }
        };
        fetchModulesForCourse();
    }, [selectedCourseId]);

    const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCourseId(Number(e.target.value));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'module_id' || name === 'difficulty_level' || name === 'points' ? Number(value) : value,
        }));
    };

    const handleAddOption = () => {
        setOptions((prev) => [...prev, { text: '', isCorrect: false }]);
    };

    const handleOptionChange = (index: number, field: 'text' | 'isCorrect', value: any) => {
        setOptions((prev) => {
            const newOptions = [...prev];
            if (field === 'isCorrect' && value === true) {
                // En single choice usualmente solo hay una correcta, o múltiples si así se define.
                // Asumiremos que solo hay 1 correcta. Si la marcan como true, el resto a false.
                newOptions.forEach((o) => (o.isCorrect = false));
            }
            newOptions[index] = { ...newOptions[index], [field]: value };
            return newOptions;
        });
    };

    const handleRemoveOption = (index: number) => {
        setOptions((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (formData.module_id === 0) {
                throw new Error('Por favor seleccione un módulo válido.');
            }

            // Validar opciones si es múltiple selección
            if (formData.exercise_type === 'MULTIPLE_CHOICE') {
                const hasCorrect = options.some((o) => o.isCorrect);
                const allFilled = options.every((o) => o.text.trim() !== '');
                if (!hasCorrect || !allFilled || options.length < 2) {
                    throw new Error(
                        'Para Selección Múltiple, debes agregar al menos 2 opciones, todas con texto, y al menos una correcta.',
                    );
                }
            }

            const createdExercise = await createExercise(formData);

            // Si es múltiple selección, guardar las opciones
            if (formData.exercise_type === 'MULTIPLE_CHOICE') {
                await Promise.all(
                    options.map((opt) =>
                        createExerciseOption({
                            exercise_id: createdExercise.id,
                            option_text: opt.text,
                            is_correct: opt.isCorrect,
                        }),
                    ),
                );
            }

            router.push('/ejercicios/manage');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || err.message || 'Error al crear el ejercicio');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />

            <main className="max-w-3xl mx-auto px-6 py-12">
                <header className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="text-gray-500 hover:text-gray-900 flex items-center gap-2 mb-4 font-bold text-sm"
                    >
                        ← Volver a Gestión
                    </button>
                    <h1 className="text-3xl font-extrabold text-gray-900">Crear Nuevo Ejercicio</h1>
                </header>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-[2rem] shadow-sm ring-1 ring-black/5 p-8 space-y-6"
                >
                    {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium">{error}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Título</label>
                            <input
                                required
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Ej. Declara una variable"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Grupo</label>
                            <select
                                required
                                value={selectedCourseId}
                                onChange={handleCourseChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700"
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
                            <label className="block text-sm font-bold text-gray-700 mb-2">Módulo</label>
                            <select
                                required
                                name="module_id"
                                value={formData.module_id}
                                onChange={handleChange}
                                disabled={modules.length === 0}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {modules.length === 0 && <option value={0}>Este curso no tiene módulos</option>}
                                {modules.map((mod) => (
                                    <option key={mod.id} value={mod.id}>
                                        {mod.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Ejercicio</label>
                            <select
                                name="exercise_type"
                                value={formData.exercise_type}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="MULTIPLE_CHOICE">Selección Múltiple</option>
                                <option value="CODING">Código</option>
                                <option value="TRUE_FALSE">Verdadero o Falso</option>
                            </select>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Dificultad (1-3)</label>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    max="3"
                                    name="difficulty_level"
                                    value={formData.difficulty_level}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Puntos</label>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    name="points"
                                    value={formData.points}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Descripción</label>
                        <textarea
                            required
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe lo que el estudiante debe hacer..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Explicación (Feedback)</label>
                        <textarea
                            required
                            name="explanation"
                            value={formData.explanation}
                            onChange={handleChange}
                            rows={2}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Explicación que se mostrará al enviar la respuesta..."
                        />
                    </div>

                    {formData.exercise_type === 'MULTIPLE_CHOICE' && (
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-gray-700">Opciones de Respuesta</h3>
                                <button
                                    type="button"
                                    onClick={handleAddOption}
                                    className="text-xs bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full hover:bg-blue-200"
                                >
                                    + Agregar Opción
                                </button>
                            </div>

                            <div className="space-y-3">
                                {options.map((opt, index) => (
                                    <div
                                        key={index}
                                        className="flex gap-3 items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm"
                                    >
                                        <input
                                            type="radio"
                                            name="correct_option"
                                            checked={opt.isCorrect}
                                            onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                                            className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                                            title="Marcar como correcta"
                                        />
                                        <input
                                            type="text"
                                            required
                                            value={opt.text}
                                            onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                                            placeholder={`Opción ${index + 1}`}
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {options.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveOption(index)}
                                                className="text-red-500 hover:text-red-700 font-bold px-2"
                                                title="Eliminar opción"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-3">
                                Selecciona el círculo a la izquierda de la opción para marcarla como la respuesta
                                correcta.
                            </p>
                        </div>
                    )}

                    {formData.exercise_type === 'CODING' && (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Código Inicial (Starter Code)
                                </label>
                                <textarea
                                    name="starterCode"
                                    value={formData.starterCode}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full bg-gray-900 text-green-400 font-mono text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="def funcion():..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Solución Esperada</label>
                                <textarea
                                    name="solutionCode"
                                    value={formData.solutionCode}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full bg-gray-900 text-green-400 font-mono text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="def funcion(): return True"
                                />
                            </div>
                        </>
                    )}

                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[#4A86F7] hover:bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Crear Ejercicio'}
                        </button>
                    </div>
                </form>
            </main>

            <Footer />
        </div>
    );
}
