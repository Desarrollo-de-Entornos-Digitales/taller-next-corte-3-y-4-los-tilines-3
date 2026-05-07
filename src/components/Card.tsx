'use client';

import { FeedItem } from '../app/(dashboard)/services/feedService';

interface CardProps {
  item?: FeedItem;
  title?: string;
  description?: string;
  image?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export default function Card({
  item,
  title = 'Exercise',
  description = 'Algo sobre el ejercicio',
  image = 'Purple.svg',
  buttonText = 'Start',
  onButtonClick,
}: CardProps) {
  // Configuración dinámica basada en el item del feed
  const displayTitle = item?.title || title;
  const displayDescription = item?.description || description;
  const displayImage = item?.image || image;
  // Colores y gradientes según el ID para variedad visual
  const getVisualConfig = () => {
    const configs = [
      { bg: 'bg-gradient-to-br from-pink-500 to-rose-600', icon: '🧠' },
      { bg: 'bg-gradient-to-br from-purple-600 to-indigo-700', icon: '💻' },
      { bg: 'bg-gradient-to-br from-amber-400 to-orange-500', icon: '⚡' },
      { bg: 'bg-gradient-to-br from-teal-400 to-emerald-600', icon: '🏗️' },
      { bg: 'bg-gradient-to-br from-blue-500 to-cyan-600', icon: '📊' },
    ];
    return configs[(item?.id || 0) % configs.length];
  };

  const config = getVisualConfig();
  const isCompleted = item?.status === 'completed';
  const displayButtonText = isCompleted ? 'Review' : (item?.status === 'in_progress' ? 'Continue' : 'Start');

  const handleClick = () => {
    if (onButtonClick) onButtonClick();
    if (item) {
        // eslint-disable-next-line no-console
        console.log(`Interaction with ${item.status} item:`, item);
    }
  };

  return (
    <div className="card bg-base-100 shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <figure className={`h-40 ${config.bg} flex items-center justify-center p-4 relative`}>
        {isCompleted && (
            <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/30 shadow-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
            </div>
        )}
        {!item?.image && !image.includes('/') && (
             <div className="text-6xl filter drop-shadow-lg transform hover:scale-110 transition-transform duration-300 select-none">
                {config.icon}
             </div>
        )}
        {(item?.image || image.includes('/')) && (
            <img src={displayImage} alt={displayTitle} className="max-h-full object-contain" />
        )}
      </figure>
      <div className="card-body p-6">
        <div className="flex justify-between items-start">
            <div className="flex-1">
                <h2 className="card-title text-xl font-bold text-gray-800">{displayTitle}</h2>
                <p className="italic text-sm text-gray-500 mt-1">{displayDescription}</p>
            </div>
            
            {/* Círculo de progreso para items Ongoing */}
            {item?.status !== 'pending' && item?.progress !== undefined && (
                <div 
                    className="radial-progress text-gray-200 border-4 border-gray-100" 
                    style={{ 
                        "--value": item.progress, 
                        "--size": "4rem", 
                        "--thickness": "4px",
                        color: '#6366f1'
                    } as any} 
                    role="progressbar"
                >
                    <span className="text-xs font-bold text-gray-800">{item.progress}%</span>
                </div>
            )}
        </div>
        
        <div className="card-actions justify-start mt-4">
          <button 
            className={`btn border-none px-8 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 ${
                isCompleted 
                ? 'bg-gray-800 hover:bg-black' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
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
