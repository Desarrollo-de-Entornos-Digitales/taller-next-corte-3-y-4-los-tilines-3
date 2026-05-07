// 3. src/app/(dashboard)/feed/page.tsx (Simplificado y Robusto)
'use client';

import { useEffect, useState } from 'react';
import { getFeedItems, FeedItem, FeedResponse } from '../services/feedService';
import { getMyEnrollments, Enrollment } from '../services/courseService';
import Card from '../../../components/Card';
import NavBar from '../../../components/NavBar';
import Hero from '../../../components/Hero';
import Footer from '../../../components/Footer';

export default function FeedPage() {
  const [feedData, setFeedData] = useState<FeedResponse | null>(null);
  const [courses, setCourses] = useState<Enrollment[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('User');

  useEffect(() => {
    const initDashboard = async () => {
      try {
        setLoading(true);
        const userStr = localStorage.getItem('user');
        
        let userId = 0;
        if (userStr) {
          const user = JSON.parse(userStr);
          setUsername(user.username || 'User');
          userId = user.id;
        }

        // 1. Intentar cargar cursos (pero no morir si falla)
        let enrollments: Enrollment[] = [];
        if (userId) {
          try {
            enrollments = await getMyEnrollments(userId);
            setCourses(enrollments);
          } catch (e) {
            console.warn("No enrollments found for this user");
          }
        }

        // 2. Cargar feed
        if (enrollments.length > 0) {
          const firstCourseId = enrollments[0].course_id;
          setSelectedCourseId(firstCourseId);
          await loadFeed(1, firstCourseId);
        } else {
          // Si no hay cursos inscritos (Admin o nuevo), cargar el feed por defecto del sistema
          await loadFeed(1);
        }
      } catch (err) {
        console.error("Dashboard init error:", err);
        setError("Could not load your dashboard. Try logging in again.");
      } finally {
        setLoading(false);
      }
    };
    initDashboard();
  }, []);

  const loadFeed = async (page: number, courseId?: number) => {
    try {
      setLoading(true);
      const data = await getFeedItems(page, 6, courseId);
      setFeedData(data);
    } catch (err) {
      setError("Error loading modules for this course.");
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (courseId: number) => {
    setSelectedCourseId(courseId);
    loadFeed(1, courseId);
  };

  // Filtros de UI
  const getItemsByStatus = (status: string) => 
    feedData?.data.filter(item => item.status === status) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <Hero isDashboard={true} username={username} />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Selector de Cursos Estilizado */}
        {courses.length > 0 && (
          <div className="mb-10 p-6 bg-white rounded-3xl shadow-sm border border-gray-100 flex gap-4 overflow-x-auto">
            {courses.map((e) => (
              <button
                key={e.id}
                onClick={() => handleCourseChange(e.course_id)}
                className={`px-6 py-2 rounded-full font-bold transition-all ${
                  selectedCourseId === e.course_id 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {e.courses.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
             <span className="loading loading-spinner loading-lg text-primary"></span>
             <p className="mt-4 text-gray-400 italic">Fetching your progress...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Sección: Pendientes */}
            <Section title="Pending" color="bg-pink-500" items={getItemsByStatus('pending')} />
            
            {/* Sección: En Progreso */}
            <Section title="Ongoing" color="bg-teal-500" items={getItemsByStatus('in_progress')} />
            
            {/* Sección: Completados */}
            <Section title="Completed" color="bg-gray-800" items={getItemsByStatus('completed')} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

// Componente Interno para las secciones
function Section({ title, color, items }: { title: string, color: string, items: FeedItem[] }) {
  return (
    <section>
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-2 h-8 ${color} rounded-full`}></div>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <span className="text-sm font-bold bg-gray-200 px-3 py-1 rounded-full">{items.length}</span>
      </div>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map(item => <Card key={item.id} item={item} />)}
        </div>
      ) : (
        <p className="text-gray-400 italic bg-white p-8 rounded-2xl border-2 border-dashed border-gray-100 text-center">
          Nothing here yet!
        </p>
      )}
    </section>
  );
}
