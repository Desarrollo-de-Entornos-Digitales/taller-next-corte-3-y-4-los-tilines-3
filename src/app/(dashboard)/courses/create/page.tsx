'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { courseService } from '../../services/courseService';
import { getProfessors, UserBrief } from '../../services/userService';

export default function CreateCoursePage() {
  const router = useRouter();
  const { user, canManageCourses, isAdmin } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [professorId, setProfessorId] = useState<number | ''>('');
  const [professors, setProfessors] = useState<UserBrief[]>([]);
  const [professorsLoading, setProfessorsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    let mounted = true;
    (async () => {
      try {
        setProfessorsLoading(true);
        const list = await getProfessors();
        if (!mounted) return;
        setProfessors(list);
        if (list.length > 0) setProfessorId(list[0].id);
      } catch (e) {
        // ignore - fallback to numeric input
      } finally {
        if (mounted) setProfessorsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    try {
      const pid = isAdmin && professorId ? Number(professorId) : user?.id ?? undefined;
      await courseService.create({ name: name.trim(), description: description.trim(), professor_id: pid as number });
      router.push('/courses');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar />

      {!canManageCourses ? (
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
          <div className="bg-white rounded-3xl p-12 text-center">
            <h3 className="text-xl font-bold">Access denied</h3>
            <p className="text-gray-500 mt-2">You don't have permission to create courses.</p>
          </div>
        </main>
      ) : (
        <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
          <div className="bg-white rounded-3xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-black text-gray-900">Create Course</h1>
                <p className="text-gray-500 mt-1">Add a new learning path to the platform.</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Course name"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Short description (optional)"
                />
              </div>

              {isAdmin && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Assign Professor</label>
                  {professorsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="loading loading-spinner loading-sm" />
                      Loading professors...
                    </div>
                  ) : professors.length > 0 ? (
                    <select
                      value={professorId}
                      onChange={(e) => setProfessorId(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 text-gray-700"
                    >
                      {professors.map((p) => (
                        <option key={p.id} value={p.id}>
                          #{p.id} - {p.username}{p.email ? ` (${p.email})` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <>
                      <input
                        value={professorId}
                        onChange={(e) => setProfessorId(e.target.value === '' ? '' : Number(e.target.value))}
                        type="number"
                        className="w-48 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="Professor ID (fallback)"
                      />
                      <p className="text-xs text-gray-400 mt-1">Could not load professors list from backend. Enter a valid professor_id manually.</p>
                    </>
                  )}

                  {professors.length > 0 && (
                    <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Available professors</p>
                      <div className="max-h-40 overflow-auto space-y-1">
                        {professors.map((p) => (
                          <div key={`prof-list-${p.id}`} className="text-sm text-gray-700">
                            <span className="font-semibold">#{p.id}</span> - {p.username}{p.email ? ` (${p.email})` : ''}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 justify-end">
                <button type="button" onClick={() => router.push('/courses')} className="btn btn-ghost">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn bg-[#1E3A8A] hover:bg-blue-800 text-white border-none px-6 rounded-xl shadow-md"
                >
                  {loading ? <span className="loading loading-spinner loading-sm" /> : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </main>
      )}

      <Footer />
    </div>
  );
}
