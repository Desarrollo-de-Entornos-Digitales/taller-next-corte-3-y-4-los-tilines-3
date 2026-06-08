'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { moduleService, ModuleEntity } from '../../services/moduleService';
import NavBar from '../../../../components/NavBar';
import Footer from '../../../../components/Footer';

export default function ManageModulesPage() {
  const router = useRouter();
  const [modules, setModules] = useState<ModuleEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      setLoading(true);
      const data = await moduleService.getAll();
      setModules(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load modules.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este módulo?')) {
      try {
        await moduleService.remove(id);
        await loadModules();
      } catch (err) {
        console.error(err);
        alert('Failed to delete module');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        <header className="mb-8 rounded-[2rem] bg-white px-8 py-6 shadow-sm ring-1 ring-black/5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Panel de Control</p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl text-gray-900">Gestión de Módulos</h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-600">
                Administra los módulos de aprendizaje. Puedes asignar ejercicios a cada módulo posteriormente.
              </p>
            </div>
            <button
              onClick={() => router.push('/modules/create')}
              className="bg-[#4A86F7] hover:bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-md transition-all active:scale-95"
            >
              + Nuevo Módulo
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
            {modules.map((mod) => (
              <div key={mod.id} className="bg-white rounded-[2rem] p-6 shadow-sm ring-1 ring-black/5 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-pastel-blue text-blue-800">
                      Orden: {mod.level_order}
                    </span>
                    <span className="text-xs font-bold text-gray-400">ID Curso: {mod.course_id || 'N/A'}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{mod.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-3 mb-6">{mod.description}</p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push(`/modules/edit/${mod.id}`)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl text-sm font-bold transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(mod.id)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-xl text-sm font-bold transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
            
            {modules.length === 0 && !error && (
              <div className="col-span-full bg-white rounded-3xl p-12 text-center text-gray-500">
                No hay módulos creados aún.
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
