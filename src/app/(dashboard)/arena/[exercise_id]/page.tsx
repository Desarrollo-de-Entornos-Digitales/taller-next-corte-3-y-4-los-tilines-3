'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import {
    getExerciseById,
    getExerciseOptions,
    createExerciseAttempt,
    Exercise,
    ExerciseOption,
} from '../../services/exerciseManageService';
import NavBar from '../../../../components/NavBar';
import Footer from '../../../../components/Footer';

export default function StudentArenaPage() {
    const router = useRouter();
    const params = useParams();
    const exerciseId = Number(params.exercise_id);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [exercise, setExercise] = useState<Exercise | null>(null);
    const [options, setOptions] = useState<ExerciseOption[]>([]);

    // User input state
    const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
    const [codeAnswer, setCodeAnswer] = useState<string>('');

    // Feedback state
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    useEffect(() => {
        if (!exerciseId) return;

        const fetchExerciseData = async () => {
            try {
                const ex = await getExerciseById(exerciseId);
                setExercise(ex);

                if (ex.exercise_type === 'MULTIPLE_CHOICE') {
                    const opts = await getExerciseOptions(exerciseId);
                    setOptions(opts);
                } else if (ex.exercise_type === 'CODING' && ex.starterCode) {
                    setCodeAnswer(ex.starterCode);
                }
            } catch (err) {
                console.error('Failed to load exercise', err);
            } finally {
                setLoading(false);
            }
        };

        fetchExerciseData();
    }, [exerciseId]);

    const handleSubmit = async () => {
        if (!exercise) return;
        setSubmitting(true);

        let correct = false;
        let answerSubmitted = '';

        if (exercise.exercise_type === 'MULTIPLE_CHOICE') {
            if (!selectedOptionId) {
                alert('Por favor selecciona una opción.');
                setSubmitting(false);
                return;
            }
            const selectedOpt = options.find((o) => o.id === selectedOptionId);
            correct = selectedOpt?.is_correct || false;
            answerSubmitted = selectedOpt?.option_text || '';
        } else if (exercise.exercise_type === 'CODING') {
            // Simple validation: just checking if it is not empty,
            // ideally we would evaluate against tests or solutionCode.
            // We'll do a simple match for demonstration.
            answerSubmitted = codeAnswer;
            correct = codeAnswer.trim() === exercise.solutionCode?.trim();
        } else if (exercise.exercise_type === 'TRUE_FALSE') {
            // Omitted for brevity, assuming multiple choice covers this or it's handled similarly.
            // Will treat it as text matching.
            answerSubmitted = codeAnswer;
            correct = codeAnswer.trim().toLowerCase() === exercise.solutionCode?.trim().toLowerCase();
        }

        setIsCorrect(correct);

        // Simulate getting user ID from local storage or context
        const userDataStr = localStorage.getItem('user');
        let userId = 1; // Fallback
        if (userDataStr) {
            try {
                const user = JSON.parse(userDataStr);
                if (user && user.id) userId = user.id;
            } catch (e) {}
        }

        try {
            await createExerciseAttempt({
                user_id: userId,
                exercise_id: exercise.id,
                answerd_submited: answerSubmitted,
                is_correct: correct,
                feedback: correct
                    ? '¡Excelente trabajo! Has resuelto el ejercicio correctamente.'
                    : 'La respuesta es incorrecta. ' + exercise.explanation,
                score: correct ? exercise.points : 0,
                attempt_date: new Date().toISOString(),
            });
            setIsSubmitted(true);
        } catch (err) {
            console.error('Failed to register attempt', err);
            alert('Hubo un error al guardar tu respuesta.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <NavBar />
                <div className="flex-1 flex items-center justify-center w-full">
                    <span className="loading loading-spinner loading-lg text-[#4A86F7]"></span>
                </div>
                <Footer />
            </div>
        );
    }

    if (!exercise) {
        return <div className="p-10 text-center">Ejercicio no encontrado.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <NavBar />

            <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
                <div className="flex gap-4 items-center mb-8">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-500 hover:text-[#4A86F7] transition-colors"
                    >
                        ←
                    </button>
                    <div className="flex-1">
                        <div className="flex gap-2 items-center">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-pastel-blue text-blue-800">
                                Nivel {exercise.difficulty_level}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 flex gap-1 items-center">
                                <span>⭐</span> {exercise.points} pts
                            </span>
                        </div>
                        <h1 className="mt-2 text-3xl font-extrabold text-gray-900">{exercise.title}</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Columna Izquierda: Instrucciones */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-[2rem] p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] h-full">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span>📝</span> Instrucciones
                            </h3>
                            <p className="text-gray-600 leading-relaxed text-sm">{exercise.description}</p>
                        </div>
                    </div>

                    {/* Columna Derecha: El Reto */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] border border-gray-100">
                            {!isSubmitted ? (
                                <>
                                    <h3 className="text-xl font-bold text-gray-900 mb-6">Tu Respuesta</h3>

                                    {exercise.exercise_type === 'MULTIPLE_CHOICE' && (
                                        <div className="space-y-4">
                                            {options.map((opt) => (
                                                <label
                                                    key={opt.id}
                                                    className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                                                        selectedOptionId === opt.id
                                                            ? 'border-[#4A86F7] bg-blue-50/50'
                                                            : 'border-gray-100 bg-gray-50 hover:bg-gray-100 hover:border-gray-200'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="exercise_option"
                                                        className="w-5 h-5 text-[#4A86F7] focus:ring-[#4A86F7]"
                                                        checked={selectedOptionId === opt.id}
                                                        onChange={() => setSelectedOptionId(opt.id)}
                                                    />
                                                    <span className="text-gray-700 font-medium">{opt.option_text}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {exercise.exercise_type === 'CODING' && (
                                        <div className="space-y-4">
                                            <div className="bg-[#1E1E1E] rounded-2xl overflow-hidden p-4">
                                                <div className="flex gap-2 mb-4 px-2">
                                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                </div>
                                                <textarea
                                                    value={codeAnswer}
                                                    onChange={(e) => setCodeAnswer(e.target.value)}
                                                    rows={8}
                                                    className="w-full bg-transparent text-green-400 font-mono text-sm focus:outline-none resize-none px-2"
                                                    placeholder="// Escribe tu código aquí..."
                                                    spellCheck="false"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Other types like TRUE_FALSE can be added similarly */}

                                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                                        <button
                                            onClick={handleSubmit}
                                            disabled={
                                                submitting ||
                                                (exercise.exercise_type === 'MULTIPLE_CHOICE' && !selectedOptionId)
                                            }
                                            className="bg-[#4A86F7] hover:bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            {submitting ? 'Enviando...' : 'Enviar Respuesta'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <div
                                        className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                                            isCorrect ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'
                                        }`}
                                    >
                                        {isCorrect ? (
                                            <svg
                                                className="w-12 h-12"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={3}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                className="w-12 h-12"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={3}
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                    <h2
                                        className={`text-3xl font-black mb-4 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}
                                    >
                                        {isCorrect ? '¡Correcto!' : 'Incorrecto'}
                                    </h2>
                                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                        {isCorrect
                                            ? `¡Excelente trabajo! Has ganado ${exercise.points} puntos.`
                                            : `No te preocupes, el aprendizaje es un proceso. Inténtalo de nuevo.`}
                                    </p>

                                    <div className="bg-blue-50 text-blue-800 p-6 rounded-2xl text-left mb-8">
                                        <h4 className="font-bold mb-2 flex items-center gap-2">
                                            <span>💡</span> Explicación
                                        </h4>
                                        <p className="text-sm">{exercise.explanation}</p>
                                    </div>

                                    <div className="flex gap-4 justify-center">
                                        {!isCorrect && (
                                            <button
                                                onClick={() => {
                                                    setIsSubmitted(false);
                                                    setIsCorrect(false);
                                                }}
                                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-bold transition-all"
                                            >
                                                Reintentar
                                            </button>
                                        )}
                                        <button
                                            onClick={() => router.push('/feed')}
                                            className="bg-[#4A86F7] hover:bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-md transition-all"
                                        >
                                            Continuar Ruta
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
