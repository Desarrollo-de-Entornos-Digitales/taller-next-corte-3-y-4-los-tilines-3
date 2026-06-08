'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';

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
}: ArenaPlayerProps) {
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

            if (result.correct) {
                window.dispatchEvent(new CustomEvent('otly-activity-update'));
            }

            window.setTimeout(() => {
                setFeedback('idle');
                setResultMessage(null);
            }, 3500);
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
        <div className="flex flex-col gap-6">
            <header className="rounded-3xl bg-white px-6 py-5 shadow-sm border border-gray-100">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#4A86F7]">
                            Otly Arena · {typeLabel}
                        </p>
                        <h1 className="mt-1 text-2xl font-black text-gray-900">{exercise.title}</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Ejercicio {exerciseIndex} de {totalExercises} · {exercise.points} pts · Nivel{' '}
                            {exercise.difficulty_level}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href={backHref} className="btn btn-outline btn-sm border-gray-300">
                            Volver al módulo
                        </Link>
                        {prevExerciseId && (
                            <Link
                                href={`/ejercicios/arena/${prevExerciseId}?courseId=${courseId ?? ''}&moduleId=${moduleId ?? ''}`}
                                className="btn btn-ghost btn-sm"
                            >
                                ← Anterior
                            </Link>
                        )}
                        {nextExerciseId && (
                            <Link
                                href={`/ejercicios/arena/${nextExerciseId}?courseId=${courseId ?? ''}&moduleId=${moduleId ?? ''}`}
                                className="btn bg-[#1E3A8A] hover:bg-blue-800 text-white border-none btn-sm"
                            >
                                Siguiente →
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <section className={`rounded-3xl border p-6 transition-all duration-500 ${briefingBg}`}>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Documentación</p>
                    <h2 className="mt-3 text-xl font-black text-gray-900">{exercise.title}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                        {exercise.description}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                        <span
                            className="badge badge-lg text-white border-none"
                            style={{ backgroundColor: accentColor }}
                        >
                            {typeLabel}
                        </span>
                        <span className="badge badge-lg bg-gray-100 text-gray-700 border-none">
                            {exercise.language?.toUpperCase() ?? 'Código'}
                        </span>
                        <span className="badge badge-lg bg-gray-100 text-gray-700 border-none">
                            +{exercise.points} XP
                        </span>
                    </div>

                    {resultMessage && (
                        <p
                            className={`mt-4 rounded-2xl px-4 py-3 text-sm font-semibold ${
                                feedback === 'success'
                                    ? 'bg-emerald-500/15 text-emerald-900'
                                    : 'bg-rose-500/15 text-rose-900'
                            }`}
                        >
                            {resultMessage}
                        </p>
                    )}
                </section>

                <section
                    className={`flex flex-col rounded-3xl bg-white border border-gray-100 overflow-hidden transition-all duration-500 ${shellClass}`}
                >
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                            Zona de práctica
                        </span>
                        <span className="badge text-white border-none" style={{ backgroundColor: accentColor }}>
                            {typeLabel}
                        </span>
                    </div>

                    <div className="flex flex-1 flex-col gap-4 p-5">
                        {exercise.exercise_type === 'CODING' && (
                            <textarea
                                value={codeDraft}
                                onChange={(e) => setCodeDraft(e.target.value)}
                                spellCheck={false}
                                className="min-h-60 w-full resize-y rounded-2xl border border-gray-200 bg-[#1a1f2e] p-4 font-mono text-sm leading-relaxed text-[#e2e8f0] outline-none focus:border-[#4A86F7]"
                            />
                        )}

                        {exercise.exercise_type === 'MULTIPLE_CHOICE' && (
                            <div className="space-y-3">
                                <p className="text-base font-bold text-gray-900">{exercise.description}</p>
                                <div className="grid gap-2">
                                    {(exercise.options ?? []).map((option) => (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => setMcqPick(option.id)}
                                            className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                                                mcqPick === option.id
                                                    ? 'border-[#4A86F7] bg-blue-50 text-blue-900'
                                                    : 'border-gray-200 bg-white hover:border-gray-300'
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
                                        className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs md:text-sm"
                                    >
                                        <span className="w-6 shrink-0 text-center text-[10px] font-extrabold text-gray-400">
                                            {idx + 1}
                                        </span>
                                        <span className="flex-1">{line}</span>
                                        <div className="flex shrink-0 gap-1">
                                            <button
                                                type="button"
                                                className="rounded-full bg-white px-2 py-1 text-xs font-bold text-gray-600 ring-1 ring-gray-200"
                                                onClick={() => idx > 0 && moveLine(idx, idx - 1)}
                                            >
                                                ↑
                                            </button>
                                            <button
                                                type="button"
                                                className="rounded-full bg-white px-2 py-1 text-xs font-bold text-gray-600 ring-1 ring-gray-200"
                                                onClick={() => idx < orderLines.length - 1 && moveLine(idx, idx + 1)}
                                            >
                                                ↓
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {exercise.exercise_type === 'SYNTAX' && (
                            <div className="space-y-2 rounded-2xl bg-[#1a1f2e] p-4 font-mono text-sm text-gray-100">
                                {(exercise.syntaxLines ?? []).map((line) => (
                                    <button
                                        key={line.id}
                                        type="button"
                                        onClick={() => setSyntaxPick(line.id)}
                                        className={`flex w-full rounded-xl px-2 py-1.5 text-left transition ${
                                            syntaxPick === line.id ? 'bg-[#4A86F7]/50 text-white' : 'hover:bg-white/10'
                                        }`}
                                    >
                                        <span className="mr-2 text-gray-500">{line.id + 1}.</span>
                                        {line.text}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
                        <p className="text-xs text-gray-400">Feedback inmediato al enviar</p>
                        <button
                            type="button"
                            onClick={() => void handleSubmit()}
                            disabled={!canSubmit || submitting}
                            className="btn bg-[#4A86F7] hover:bg-blue-600 text-white border-none px-8 disabled:opacity-40"
                        >
                            {submitting ? <span className="loading loading-spinner loading-sm" /> : 'Enviar solución'}
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
