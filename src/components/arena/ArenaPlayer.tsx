'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { toast } from '@/lib/zustand/toastStore';

import { ArenaExercise, getExerciseTypeLabel, submitExerciseAnswer } from '@/app/(dashboard)/services/exerciseService';
import { shuffle } from '@/components/arena/exerciseUtils';
import { useProfileStore } from '@/lib/zustand/profileStore';

type Feedback = 'idle' | 'success' | 'error';

interface ArenaPlayerProps {
    exercise: ArenaExercise;
    courseId?: number;
    moduleId?: number;
    userId: number;
    exerciseIndex?: number;
    totalExercises?: number;
    nextExerciseId?: number | null;
    prevExerciseId?: number | null;
    nextModuleId?: number | null;
}

const typeColors: Record<string, string> = {
    MULTIPLE_CHOICE: '#E9539A', // Pink
    CODING: '#953DF1', // Purple
    ORDER: '#FFB800', // Yellow
    SYNTAX: '#37CDB2', // Turquoise
};

export default function ArenaPlayer({
    exercise,
    courseId,
    moduleId,
    userId,
    exerciseIndex = 1,
    totalExercises = 1,
    nextExerciseId,
    prevExerciseId,
    nextModuleId,
}: ArenaPlayerProps) {
    const router = useRouter();
    const addRecentActivity = useProfileStore((state) => state.addRecentActivity);

    const [feedback, setFeedback] = useState<Feedback>('idle');
    const [submitting, setSubmitting] = useState(false);
    const [resultMessage, setResultMessage] = useState<string | null>(null);

    const [codeDraft, setCodeDraft] = useState(exercise.starterCode ?? '');
    const [mcqPick, setMcqPick] = useState<number | null>(null);
    const [orderLines, setOrderLines] = useState<string[]>(() => shuffle(exercise.orderLines ?? []));
    const [syntaxPick, setSyntaxPick] = useState<number | null>(null);

    const typeLabel = getExerciseTypeLabel(exercise.exercise_type);
    const accentColor = (typeColors[exercise.exercise_type] as string) || '#4A86F7';

    const backHref =
        moduleId && courseId
            ? `/ejercicios/course/${courseId}/module/${moduleId}`
            : moduleId
              ? `/ejercicios/module/${moduleId}`
              : courseId
                ? `/ejercicios/course/${courseId}`
                : '/feed';

    const canSubmit = useMemo(() => {
        switch (exercise.exercise_type) {
            case 'MULTIPLE_CHOICE':
                return mcqPick !== null;
            case 'CODING':
                return codeDraft.trim().length > 0;
            case 'ORDER':
                return orderLines.length > 0;
            case 'SYNTAX':
                return syntaxPick !== null;
            default:
                return false;
        }
    }, [exercise.exercise_type, mcqPick, codeDraft, orderLines, syntaxPick]);

    const handleSubmit = useCallback(async () => {
        let answer: string | null = null;

        switch (exercise.exercise_type) {
            case 'MULTIPLE_CHOICE':
                answer = mcqPick !== null ? String(mcqPick) : null;
                break;
            case 'CODING':
                answer = codeDraft.trim() ? codeDraft : null;
                break;
            case 'ORDER':
                answer = JSON.stringify(orderLines);
                break;
            case 'SYNTAX':
                answer = syntaxPick !== null ? String(syntaxPick) : null;
                break;
            default:
                answer = null;
        }

        if (!answer || submitting) return;

        try {
            setSubmitting(true);
            const result = await submitExerciseAnswer(exercise.id, userId, answer);
            setFeedback(result.correct ? 'success' : 'error');
            setResultMessage(result.correct ? result.feedback : `${result.feedback} ${result.explanation}`);

            addRecentActivity({
                title: result.correct ? `Completaste "${exercise.title}"` : `Intentaste "${exercise.title}"`,
                description: result.correct
                    ? `Ganaste ${result.pointsEarned} puntos en Arena`
                    : 'Respuesta enviada, revisa la explicacion para mejorar',
                href: `/ejercicios/arena/${exercise.id}?courseId=${courseId ?? ''}&moduleId=${moduleId ?? ''}`,
                icon: result.correct ? 'check' : 'play',
                color: accentColor,
            });

            if (result.correct && result.newlyUnlockedAchievements && result.newlyUnlockedAchievements.length > 0) {
                result.newlyUnlockedAchievements.forEach((ach: any) => {
                    toast.success(`🏆 ¡Logro Desbloqueado: ${ach.name}!`);
                });
            }

            if (result.correct) {
                window.dispatchEvent(new CustomEvent('otly-activity-update'));

                window.setTimeout(() => {
                    if (nextExerciseId) {
                        router.push(
                            `/ejercicios/arena/${nextExerciseId}?courseId=${courseId ?? ''}&moduleId=${moduleId ?? ''}`,
                        );
                    } else if (nextModuleId) {
                        router.push(`/ejercicios/course/${courseId}/module/${nextModuleId}`);
                    } else if (courseId) {
                        router.push(`/ejercicios/course/${courseId}`);
                    } else {
                        router.push('/feed');
                    }
                }, 1800);
            } else {
                window.setTimeout(() => {
                    setFeedback('idle');
                    setResultMessage(null);
                }, 3500);
            }
        } catch {
            setFeedback('error');
            setResultMessage('No se pudo enviar la respuesta. Intenta de nuevo.');
        } finally {
            setSubmitting(false);
        }
    }, [
        addRecentActivity,
        codeDraft,
        courseId,
        exercise.exercise_type,
        exercise.id,
        exercise.title,
        mcqPick,
        moduleId,
        orderLines,
        submitting,
        syntaxPick,
        userId,
        router,
        nextExerciseId,
        nextModuleId,
    ]);

    const moveLine = (from: number, to: number) => {
        setOrderLines((prev) => {
            const next = [...prev];
            const [item] = next.splice(from, 1);
            next.splice(to, 0, item);
            return next;
        });
    };

    const shellClass =
        feedback === 'success'
            ? 'ring-2 ring-emerald-400/80 shadow-[0_0_40px_rgba(52,211,153,0.25)]'
            : feedback === 'error'
              ? 'ring-2 ring-rose-400/90 [animation:arena-shake_0.35s_ease-in-out]'
              : 'ring-1 ring-gray-200';

    const briefingBg =
        feedback === 'success'
            ? 'bg-emerald-50 border-emerald-100'
            : feedback === 'error'
              ? 'bg-rose-50 border-rose-100'
              : 'bg-amber-50 border-amber-100';

    return (
        <div className="flex flex-col font-sans">
            <header className="px-2 py-4 mb-4">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-[13px] font-bold text-[#4A86F7] mb-1">
                            Unidad {moduleId || 1} <span className="mx-2 text-gray-300">|</span> Ejercicio{' '}
                            {exerciseIndex}
                        </p>
                        <h1 className="text-[28px] font-black text-gray-900">{exercise.title}</h1>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <p className="text-[13px] text-gray-500 font-medium">
                            <span className="inline-block mr-1">⭐</span> {exercise.points} puntos
                        </p>
                        <p className="text-[13px] text-gray-500 font-medium">
                            <span className="inline-block mr-1">⏱️</span> Tiempo estimado: 3 minutos
                        </p>
                    </div>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-12">
                <div className="flex-1 flex flex-col gap-6">
                    {/* Instructions Card */}
                    {exercise.description && (
                        <div>
                            <h3 className="text-[13px] font-black text-gray-900 mb-3">Instrucciones</h3>
                            <div className="rounded-[20px] bg-white border border-gray-100 p-6 shadow-sm">
                                <p className="text-[14px] text-gray-700 leading-relaxed">{exercise.description}</p>
                            </div>
                        </div>
                    )}

                    {/* Arena Core */}
                    <div className="flex flex-col gap-6">
                        <h3 className="text-[13px] font-black text-gray-900 -mb-2">Completa el código</h3>
                        <section
                            className={`flex flex-col rounded-[20px] bg-white border p-6 transition-all duration-500 shadow-sm ${shellClass}`}
                        >
                            <div className="flex flex-1 flex-col gap-4">
                                {exercise.exercise_type === 'CODING' && (
                                    <textarea
                                        value={codeDraft}
                                        onChange={(e) => setCodeDraft(e.target.value)}
                                        spellCheck={false}
                                        className="min-h-[160px] w-full resize-none rounded-xl bg-transparent font-mono text-[14px] leading-relaxed text-gray-800 outline-none"
                                        placeholder="Escribe tu código aquí..."
                                    />
                                )}

                                {exercise.exercise_type === 'MULTIPLE_CHOICE' && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {(exercise.options ?? []).map((option) => (
                                                <button
                                                    key={option.id}
                                                    type="button"
                                                    onClick={() => setMcqPick(option.id)}
                                                    className={`rounded-2xl border-2 py-3 px-4 text-center font-mono text-[14px] font-bold transition-all ${
                                                        mcqPick === option.id
                                                            ? 'border-[#D8B4FE] bg-[#F3E8FF] text-[#6B21A8]'
                                                            : 'border-gray-100 bg-white hover:border-gray-200 text-gray-700'
                                                    }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {exercise.exercise_type === 'ORDER' && (
                                    <ul className="space-y-2">
                                        {orderLines.map((line, idx) => (
                                            <li
                                                key={`${line}-${idx}`}
                                                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 font-mono text-[13px] text-gray-700"
                                            >
                                                <span className="text-gray-400 font-bold">{idx + 1}</span>
                                                <span className="flex-1">{line}</span>
                                                <div className="flex shrink-0 gap-1">
                                                    <button
                                                        type="button"
                                                        className="p-1 hover:bg-gray-200 rounded"
                                                        onClick={() => idx > 0 && moveLine(idx, idx - 1)}
                                                    >
                                                        ↑
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="p-1 hover:bg-gray-200 rounded"
                                                        onClick={() =>
                                                            idx < orderLines.length - 1 && moveLine(idx, idx + 1)
                                                        }
                                                    >
                                                        ↓
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {exercise.exercise_type === 'SYNTAX' && (
                                    <div className="space-y-2 font-mono text-[14px] text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        {(exercise.syntaxLines ?? []).map((line) => (
                                            <button
                                                key={line.id}
                                                type="button"
                                                onClick={() => setSyntaxPick(line.id)}
                                                className={`flex w-full rounded-lg px-2 py-1.5 text-left transition ${
                                                    syntaxPick === line.id
                                                        ? 'bg-[#D8B4FE] text-[#6B21A8] font-bold'
                                                        : 'hover:bg-gray-200'
                                                }`}
                                            >
                                                <span className="mr-3 text-gray-400">{line.id + 1}</span>
                                                {line.text}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Options hint if MCQ */}
                        {exercise.exercise_type === 'MULTIPLE_CHOICE' && (
                            <h3 className="text-[13px] font-black text-gray-900 mt-2">Opciones</h3>
                        )}

                        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
                            <button
                                type="button"
                                onClick={() => void handleSubmit()}
                                disabled={!canSubmit || submitting}
                                className="w-full sm:w-auto bg-[#4A86F7] hover:bg-blue-600 text-white font-bold rounded-xl px-10 py-3.5 shadow-sm disabled:opacity-50 transition-colors"
                            >
                                {submitting ? (
                                    <span className="loading loading-spinner loading-sm" />
                                ) : (
                                    'Comprobar respuesta'
                                )}
                            </button>
                            <button
                                type="button"
                                className="text-[13px] font-bold text-[#4A86F7] hover:underline flex items-center gap-1"
                                onClick={() => {
                                    setCodeDraft(exercise.starterCode ?? '');
                                    setMcqPick(null);
                                    setSyntaxPick(null);
                                    setFeedback('idle');
                                    setResultMessage(null);
                                }}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    ></path>
                                </svg>
                                Reiniciar ejercicio
                            </button>
                        </div>

                        {resultMessage && (
                            <div
                                className={`mt-2 rounded-xl px-4 py-3 text-[14px] font-bold transition-all ${
                                    feedback === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}
                            >
                                {resultMessage}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Mascot Image */}
                <div className="w-full lg:w-[400px] flex items-center justify-center relative hidden md:flex">
                    <img
                        src="/Otly.svg"
                        alt="Mascota pensando"
                        className="w-[300px] h-auto drop-shadow-xl"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                    <div className="absolute top-10 right-20 text-6xl text-[#4A86F7] font-black rotate-12 opacity-80 animate-bounce">
                        ?
                    </div>
                    <div className="absolute top-20 left-10 text-5xl text-[#4A86F7] font-black -rotate-12 opacity-60">
                        ?
                    </div>
                </div>
            </div>
        </div>
    );
}
