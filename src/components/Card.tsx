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
}

export default function Card({
  item,
  title = 'Exercise',
  description = 'Algo sobre el ejercicio',
  image = 'Purple.svg',
  buttonText = 'Start',
  onButtonClick,
  courseId,
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
  const displayButtonText = isCompleted ? 'Review' : (item?.status === 'in_progress' ? 'Continue' : 'Start');

  const handleClick = () => {
    if (onButtonClick) onButtonClick();
    if (item) {
      if (courseId) {
        router.push(`/ejercicios/course/${courseId}/module/${item.id}`);
      } else {
        router.push(`/courses`);
      }
    }
  };

  return (
    <div className="card bg-white shadow-sm ring-1 ring-black/5 rounded-3xl overflow-hidden hover:shadow-md transition-all hover:-translate-y-1">
      <figure className={`h-40 ${config.bg} flex items-center justify-center relative`}>
        {isCompleted && (
            <div className="absolute top-3 right-3 bg-white/30 backdrop-blur-md p-2 rounded-full border border-white/40 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
            </div>
        )}
        {(item?.image || image.includes('/')) && (
            <img src={displayImage} alt={displayTitle} className="max-h-full w-full object-cover mix-blend-multiply opacity-90" />
        )}
      </figure>
      <div className="card-body p-5">
        <div className="flex justify-between items-start mb-4">
            <div className="flex-1 pr-4">
                <h2 className="text-sm font-bold text-gray-900 mb-1">
                    {displayTitle}
                </h2>
                <p className="text-[10px] text-gray-400 font-medium leading-tight">
                    {displayDescription || 'Algo sobre el ejercicio'}
                </p>
            </div>
            
            {item?.status !== 'pending' && item?.progress !== undefined && (
                <div className="flex items-center justify-center relative">
                    <div 
                        className="radial-progress bg-white text-[#4A86F7] border-[3px] border-gray-100 shadow-sm font-bold text-[10px]" 
                        style={{ 
                            "--value": item.progress, 
                            "--size": "3.5rem", 
                            "--thickness": "3px" 
                        } as any}
                        role="progressbar"
                    >
                        {item.progress}%
                    </div>
                </div>
            )}
        </div>
        
        <div className="card-actions justify-start mt-4">
          <button 
            className={`btn border-none px-6 text-white font-bold rounded-2xl shadow-sm transition-all active:scale-95 text-xs h-10 min-h-0 ${
                isCompleted 
                ? 'bg-zinc-800 hover:bg-black' 
                : 'bg-[#4A86F7] hover:bg-blue-600'
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
