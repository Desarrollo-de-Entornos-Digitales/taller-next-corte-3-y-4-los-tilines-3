'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getExercises, deleteExercise, Exercise } from '../../services/exerciseManageService';
import NavBar from '../../../../components/NavBar';
import Footer from '../../../../components/Footer';

export default function ManageExercisesPage() {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const data = await getExercises();
      setExercises(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load exercises.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this exercise?')) {
      try {
        await deleteExercise(id);
        await loadExercises();
      } catch (err) {
        console.error(err);
        alert('Failed to delete exercise');
      }
    }
  };

  const getDifficultyColor = (level: number) => {
    if (level === 1) return 'bg-pastel-blue text-blue-800';
    if (level === 2) return 'bg-pastel-yellow text-yellow-800';
    return 'bg-rose-300 text-rose-900';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      MULTIPLE_CHOICE: 'Selección Múltiple',
      CODING: 'Código',
      TRUE_FALSE: 'Verdadero/Falso'
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-8 rounded-[2rem] bg-white px-8 py-6 shadow-sm ring-1 ring-black/5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Panel Docente</p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl text-gray-900">Gestión de Ejercicios</h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-600">
                Crea, edita y elimina los ejercicios disponibles en los módulos del curso.
              </p>
            </div>
            <button
              onClick={() => router.push('/ejercicios/manage/create')}
              className="bg-[#4A86F7] hover:bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-md transition-all active:scale-95"
            >
              + Nuevo Ejercicio
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise) => (
              <div key={exercise.id} className="bg-white rounded-[2rem] p-6 shadow-sm ring-1 ring-black/5 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(exercise.difficulty_level)}`}>
                      Nivel {exercise.difficulty_level}
                    </span>
                    <span className="text-sm font-bold text-gray-400">{exercise.points} pts</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{exercise.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">{exercise.description}</p>
                  
                  <div className="flex items-center gap-2 mb-6">
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold">
                      {getTypeLabel(exercise.exercise_type)}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push(`/ejercicios/manage/edit/${exercise.id}`)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl text-sm font-bold transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(exercise.id)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-xl text-sm font-bold transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
