'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { achievementsManageService, CreateAchievementDto } from '../../services/achievementsManageService';
import { Achievement } from '../../services/achievementsService';

export default function LogrosManagePage() {
    const { user, isAdmin } = useAuth();
    const router = useRouter();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<number | null>(null);

    // Form state
    const [formData, setFormData] = useState<CreateAchievementDto>({
        name: '',
        description: '',
        points_required: 10,
    });

    useEffect(() => {
        // Simple role check based on isAdmin from context
        if (!isAdmin && user) {
            router.push('/logros');
            return;
        }
        
        if (isAdmin) {
            fetchAchievements();
        }
    }, [isAdmin, user, router]);

    const fetchAchievements = async () => {
        try {
            setLoading(true);
            const data = await achievementsManageService.getAll();
            setAchievements(data);
        } catch (error) {
            console.error('Error fetching achievements', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setIsEditing(false);
        setCurrentId(null);
        setFormData({ name: '', description: '', points_required: 10 });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (ach: Achievement) => {
        setIsEditing(true);
        setCurrentId(ach.id);
        setFormData({
            name: ach.name,
            description: ach.description,
            points_required: ach.points_required,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este logro? Esta acción no se puede deshacer.')) return;
        
        try {
            await achievementsManageService.delete(id);
            fetchAchievements();
        } catch (error) {
            console.error('Error deleting achievement', error);
            alert('No se pudo eliminar el logro.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && currentId) {
                await achievementsManageService.update(currentId, formData);
            } else {
                await achievementsManageService.create(formData);
            }
            setIsModalOpen(false);
            fetchAchievements();
        } catch (error) {
            console.error('Error saving achievement', error);
            alert('Error al guardar el logro.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-screen bg-gray-50">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in font-sans pb-20">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Administrar Logros</h1>
                    <p className="text-gray-500 text-sm mt-1">Crea, edita y elimina los logros disponibles para los estudiantes.</p>
                </div>
                <button 
                    onClick={handleOpenCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-full shadow-md transition-all flex items-center gap-2"
                >
                    <span className="text-xl leading-none">+</span> Crear Logro
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider border-b border-gray-100">
                                <th className="p-5 font-bold">ID</th>
                                <th className="p-5 font-bold">Nombre</th>
                                <th className="p-5 font-bold">Descripción</th>
                                <th className="p-5 font-bold text-center">XP Requerida</th>
                                <th className="p-5 font-bold text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {achievements.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">
                                        No hay logros creados todavía. ¡Comienza a crear el primero!
                                    </td>
                                </tr>
                            ) : (
                                achievements.map((ach) => (
                                    <tr key={ach.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="p-5 text-gray-500 font-medium">#{ach.id}</td>
                                        <td className="p-5">
                                            <div className="font-bold text-gray-900 flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm shadow-sm">
                                                    🏆
                                                </div>
                                                {ach.name}
                                            </div>
                                        </td>
                                        <td className="p-5 text-sm text-gray-600 max-w-md truncate">{ach.description}</td>
                                        <td className="p-5 text-center">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold text-xs">
                                                {ach.points_required} XP
                                            </span>
                                        </td>
                                        <td className="p-5 text-center flex justify-center gap-2">
                                            <button 
                                                onClick={() => handleOpenEdit(ach)}
                                                className="w-8 h-8 rounded-full bg-yellow-50 text-yellow-600 hover:bg-yellow-100 flex items-center justify-center transition-colors shadow-sm border border-yellow-200/50"
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(ach.id)}
                                                className="w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors shadow-sm border border-red-200/50"
                                                title="Eliminar"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all scale-100">
                        <h2 className="text-2xl font-black text-gray-900 mb-6">
                            {isEditing ? 'Editar Logro' : 'Nuevo Logro'}
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del logro</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                                    placeholder="Ej. Primeros Pasos"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                                <textarea 
                                    required
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm resize-none"
                                    placeholder="Completa tu primer ejercicio en la plataforma..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Experiencia (XP) Requerida</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    required
                                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-bold text-blue-600"
                                    value={formData.points_required}
                                    onChange={(e) => setFormData({...formData, points_required: Number(e.target.value)})}
                                />
                                <p className="text-xs text-gray-500 mt-1">Puntos totales que debe acumular el estudiante para desbloquearlo.</p>
                            </div>

                            <div className="flex gap-3 pt-6 mt-6 border-t border-gray-100">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-full transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-md transition-colors"
                                >
                                    {isEditing ? 'Guardar Cambios' : 'Crear Logro'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
