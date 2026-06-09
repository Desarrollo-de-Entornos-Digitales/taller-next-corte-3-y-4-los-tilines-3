'use client';

import { useRouter } from 'next/navigation';

import { FeedItem } from '../app/(dashboard)/services/feedService';

interface CardProps {
    item?: FeedItem;
    title?: string;
    description?: string;
    image?: string;
    buttonText?: string;
    onButtonClick?: () => void;
    courseId?: number;
    href?: string;
}

export default function Card({
    item,
    title = 'Exercise',
    description = 'Algo sobre el ejercicio',
    image = 'Purple.svg',
    buttonText = 'Start',
    onButtonClick,
    courseId,
    href,
}: CardProps) {
    const router = useRouter();
    // Configuración dinámica basada en el item del feed
    const displayTitle = item?.title || title;
    const displayDescription = item?.description || description;
    const displayImage = item?.image || image;
    // Colores sólidos exactos de la imagen
    const getVisualConfig = () => {
        const configs = [
            { bg: 'bg-[#E9539A]' }, // Rosa
            { bg: 'bg-[#953DF1]' }, // Morado
            { bg: 'bg-[#FAD94C]' }, // Amarillo
            { bg: 'bg-[#37CDB2]' }, // Turquesa
        ];
        return configs[(item?.id || 0) % configs.length];
    };

    const config = getVisualConfig();
    const isCompleted = item?.status === 'completed';
    const displayButtonText = isCompleted ? 'Review' : item?.status === 'in_progress' ? 'Continue' : 'Start';

    const handleClick = () => {
        if (onButtonClick) onButtonClick();
        if (href) {
            router.push(href);
        } else if (item) {
            if (courseId) {
                router.push(`/ejercicios/course/${courseId}/module/${item.id}`);
            } else {
                router.push(`/courses`);
            }
        }
    };

    return (
        <div className="card bg-white border border-gray-100 rounded-[2rem] overflow-hidden hover:shadow-lg hover:shadow-gray-200/50 transition-all hover:-translate-y-1">
            <figure className={`h-40 ${config.bg} flex items-center justify-center relative`}>
                {isCompleted && (
                    <div className="absolute top-3 right-3 bg-white/30 backdrop-blur-md p-2 rounded-full border border-white/40 shadow-sm">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}
                {/* Imagen eliminada para mantener el estilo flat y limpio de Otly */}
            </figure>
            <div className="card-body p-6">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex-1 pr-4">
                        <h2 className="text-lg font-bold text-gray-900 mb-1">{displayTitle}</h2>
                        <p className="text-xs text-gray-500 font-medium leading-tight">
                            {displayDescription || 'Algo sobre el ejercicio'}
                        </p>
                    </div>

                    {item?.status !== 'pending' && item?.progress !== undefined && (
                        <div className="flex-shrink-0 flex items-center justify-center relative w-12 h-12 rounded-full border-2 border-gray-200">
                            <span className="text-xs font-bold text-gray-900">{item.progress}%</span>
                        </div>
                    )}
                </div>

                <div className="card-actions justify-start mt-2">
                    <button
                        className={`btn border-none px-8 text-white font-bold rounded-xl shadow-sm transition-all active:scale-95 text-sm h-11 min-h-0 ${
                            isCompleted ? 'bg-zinc-800 hover:bg-black' : 'bg-[#3b82f6] hover:bg-blue-600'
                        }`}
                        onClick={handleClick}
                    >
                        {displayButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
}
