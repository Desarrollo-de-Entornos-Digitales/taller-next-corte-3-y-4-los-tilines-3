'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { moduleService, CreateModuleDto } from '../../services/moduleService';
import { courseService, Course } from '../../services/courseService';
import NavBar from '../../../../components/NavBar';
import Footer from '../../../../components/Footer';

export default function CreateModulePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  
  const [formData, setFormData] = useState<CreateModuleDto>({
    title: '',
    description: '',
    level_order: 1,
    course_id: 0,
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseService.getAll();
        setCourses(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, course_id: data[0].id }));
        }
      } catch (err) {
        console.error('Failed to load courses', err);
      }
    };
    fetchCourses();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'level_order' || name === 'course_id' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!formData.course_id) {
         throw new Error("Debe seleccionar un curso válido.");
      }
      await moduleService.create(formData);
      router.push('/modules/manage');
    } catch (err: any) {
      console.error(err);
      setError(err.message || err.response?.data?.message || 'Error al crear el módulo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar />
      
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
        <header className="mb-8">
          <button 
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-900 flex items-center gap-2 mb-4 font-bold text-sm transition-colors"
          >
            ← Volver a Gestión
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900">Crear Nuevo Módulo</h1>
        </header>

        <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] shadow-sm ring-1 ring-black/5 p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Título del Módulo</label>
              <input 
                required
                type="text" 
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                placeholder="Ej. Variables y Tipos de Datos"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Curso Asociado</label>
              <select 
                required
                name="course_id"
                value={formData.course_id}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700"
              >
                {courses.length === 0 && <option value={0}>Cargando cursos...</option>}
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Orden del Módulo (Nivel)</label>
              <input 
                required
                type="number" 
                min="1"
                name="level_order"
                value={formData.level_order}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
              />
              <p className="text-xs text-gray-400 mt-2">Determina el orden en el que el estudiante debe completar los módulos.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Descripción</label>
              <textarea 
                required
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                placeholder="Describe brevemente el contenido de este módulo..."
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button 
              type="submit"
              disabled={loading || courses.length === 0}
              className="bg-[#4A86F7] hover:bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Crear Módulo'}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
