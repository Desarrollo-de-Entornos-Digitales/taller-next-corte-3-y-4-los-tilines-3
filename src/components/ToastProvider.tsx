'use client';

import { useToastStore } from '@/lib/zustand/toastStore';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export default function ToastProvider() {
    const toasts = useToastStore((state) => state.toasts);
    const removeToast = useToastStore((state) => state.removeToast);

    return (
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast) => {
                const getStyle = () => {
                    switch (toast.type) {
                        case 'success':
                            return {
                                bg: 'bg-white',
                                border: 'border-green-100',
                                icon: <CheckCircle className="text-green-500 w-5 h-5" />,
                            };
                        case 'error':
                            return {
                                bg: 'bg-white',
                                border: 'border-red-100',
                                icon: <AlertCircle className="text-red-500 w-5 h-5" />,
                            };
                        case 'warning':
                            return {
                                bg: 'bg-white',
                                border: 'border-orange-100',
                                icon: <AlertTriangle className="text-orange-500 w-5 h-5" />,
                            };
                        case 'info':
                        default:
                            return {
                                bg: 'bg-white',
                                border: 'border-blue-100',
                                icon: <Info className="text-blue-500 w-5 h-5" />,
                            };
                    }
                };

                const style = getStyle();

                return (
                    <div
                        key={toast.id}
                        className={`${style.bg} ${style.border} border shadow-xl rounded-2xl p-4 flex items-start gap-3 w-[300px] pointer-events-auto animate-fade-in-up`}
                    >
                        <div className="mt-0.5 shrink-0">{style.icon}</div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-gray-800">{toast.message}</p>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
