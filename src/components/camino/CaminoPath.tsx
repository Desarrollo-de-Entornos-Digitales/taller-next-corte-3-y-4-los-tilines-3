'use client';

import Link from 'next/link';

export type CaminoNodeState = 'done' | 'current' | 'locked';

export interface CaminoNode {
    id: number;
    label: string;
    description?: string;
    state: CaminoNodeState;
    href?: string;
    progress?: number;
    meta?: string;
}

interface CaminoPathProps {
    title: string;
    subtitle: string;
    description?: string;
    nodes: CaminoNode[];
    overallProgress: number;
    completedLabel?: string;
    activeLabel?: string;
    lockedLabel?: string;
}

const nodeStyles: Record<CaminoNodeState, string> = {
    done: 'bg-gradient-to-br from-[#37CDB2] to-emerald-500 text-white hover:-translate-y-1 hover:shadow-lg',
    current:
        'bg-gradient-to-br from-[#4A86F7] to-[#1E3A8A] text-white ring-4 ring-blue-200 hover:-translate-y-1 hover:shadow-lg',
    locked: 'bg-gray-200 text-gray-500',
};

export default function CaminoPath({
    title,
    subtitle,
    description,
    nodes,
    overallProgress,
    completedLabel = 'completados',
    activeLabel = 'activo',
    lockedLabel = 'bloqueados',
}: CaminoPathProps) {
    const doneCount = nodes.filter((node) => node.state === 'done').length;
    const currentCount = nodes.filter((node) => node.state === 'current').length;
    const lockedCount = nodes.filter((node) => node.state === 'locked').length;

    return (
        <section className="rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="relative p-6 md:p-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(74,134,247,0.08),transparent_40%),radial-gradient(circle_at_90%_80%,rgba(55,205,178,0.08),transparent_45%)]" />

                <div className="relative mb-8">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#4A86F7]">{subtitle}</p>
                    <h2 className="mt-2 text-2xl font-black text-gray-900">{title}</h2>
                    {description && (
                        <p className="mt-2 max-w-2xl text-sm text-gray-600 leading-relaxed">{description}</p>
                    )}
                </div>

                <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-md space-y-3">
                        <h3 className="text-lg font-black text-gray-900">Progreso</h3>
                        <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-[#4A86F7] to-[#37CDB2] transition-all duration-500"
                                style={{ width: `${overallProgress}%` }}
                            />
                        </div>
                        <p className="text-sm font-medium text-gray-600">
                            {overallProgress}% · {doneCount} de {nodes.length} superados
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs font-bold">
                        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-800">
                            {doneCount} {completedLabel}
                        </span>
                        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-blue-800">
                            {currentCount} {activeLabel}
                        </span>
                        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-gray-600">
                            {lockedCount} {lockedLabel}
                        </span>
                    </div>
                </div>

                <div className="relative mt-10 overflow-x-auto pb-2">
                    <div className="flex min-w-max items-start gap-4 md:gap-6">
                        {nodes.map((node, index) => (
                            <div key={node.id} className="flex items-center gap-4 md:gap-6">
                                <div className="flex w-[130px] flex-col items-center gap-3 text-center">
                                    {node.state === 'current' && node.href ? (
                                        <Link
                                            href={node.href}
                                            className={`flex size-16 items-center justify-center rounded-full text-sm font-extrabold shadow-md transition duration-300 ${nodeStyles.current}`}
                                        >
                                            {index + 1}
                                        </Link>
                                    ) : node.state === 'done' && node.href ? (
                                        <Link
                                            href={node.href}
                                            className={`flex size-16 items-center justify-center rounded-full text-sm font-extrabold shadow-md transition duration-300 ${nodeStyles.done}`}
                                        >
                                            ✓
                                        </Link>
                                    ) : (
                                        <div
                                            className={`flex size-16 items-center justify-center rounded-full text-sm font-extrabold shadow-sm transition duration-300 ${nodeStyles[node.state]}`}
                                        >
                                            {node.state === 'locked' ? (
                                                <svg
                                                    className="size-7"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M16.5 10.5V7a4.5 4.5 0 0 0-9 0v3.5M7.5 10.5h9l1.5 9h-12l1.5-9Z"
                                                    />
                                                </svg>
                                            ) : (
                                                index + 1
                                            )}
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-sm font-bold text-gray-900 line-clamp-2">{node.label}</p>
                                        <p className="text-xs font-medium text-gray-500 mt-1">
                                            {node.state === 'done'
                                                ? 'Superado'
                                                : node.state === 'current'
                                                  ? 'En curso · tocar'
                                                  : 'Bloqueado'}
                                        </p>
                                        {node.meta && (
                                            <p className="text-[10px] text-gray-400 mt-1">{node.meta}</p>
                                        )}
                                    </div>
                                </div>

                                {index < nodes.length - 1 && (
                                    <div
                                        className="mt-8 hidden h-1 w-10 shrink-0 rounded-full bg-gradient-to-r from-gray-200 to-gray-100 md:block"
                                        aria-hidden
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
