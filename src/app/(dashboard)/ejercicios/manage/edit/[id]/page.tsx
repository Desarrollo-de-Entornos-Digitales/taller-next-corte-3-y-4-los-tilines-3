'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getExerciseById, updateExercise, UpdateExerciseDto } from '../../../../services/exerciseManageService';
import NavBar from '../../../../../../components/NavBar';
import Footer from '../../../../../../components/Footer';

export default function EditExercisePage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<UpdateExerciseDto>({
    module_id: 1,
    title: '',
    description: '',
    exercise_type: 'MULTIPLE_CHOICE',
    difficulty_level: 1,
    points: 10,
    explanation: '',
    starterCode: '',
    solutionCode: ''
  });

  useEffect(() => {
    if (id) {
      loadExercise();
    }
  }, [id]);

  const loadExercise = async () => {
    try {
      const data = await getExerciseById(id);
      setFormData({
        module_id: data.module_id,
        title: data.title,
        description: data.description,
        exercise_type: data.exercise_type as any,
        difficulty_level: data.difficulty_level,
        points: data.points,
        explanation: data.explanation,
        starterCode: data.starterCode || '',
        solutionCode: data.solutionCode || ''
      });
    } catch (err: any) {
      console.error(err);
      setError('Error al cargar el ejercicio. ' + (err.response?.data?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'module_id' || name === 'difficulty_level' || name === 'points' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateExercise(id, formData);
      router.push('/ejercicios/manage');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al actualizar el ejercicio');
    } finally {
      setSaving(false);
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
          <h1 className="text-3xl font-extrabold text-gray-900">Editar Ejercicio</h1>
        </header>

        {loading ? (
          <div className="text-center py-20">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] shadow-sm ring-1 ring-black/5 p-8 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium">
                {error}
              </div>
            )}

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
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Módulo (ID)</label>
                <input 
                  required
                  type="number" 
                  name="module_id"
                  value={formData.module_id}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
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
                    min="1" max="3"
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
              />
            </div>

            {formData.exercise_type === 'CODING' && (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Código Inicial (Starter Code)</label>
                  <textarea 
                    name="starterCode"
                    value={formData.starterCode}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-gray-900 text-green-400 font-mono text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
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
                  />
                </div>
              </>
            )}

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button 
                type="submit"
                disabled={saving}
                className="bg-[#4A86F7] hover:bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
