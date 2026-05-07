'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getFeedItems, FeedItem, FeedResponse } from '../services/feedService';
import Card from '../../../components/Card';
import NavBar from '../../../components/NavBar';
import Hero from '../../../components/Hero';
import Footer from '../../../components/Footer';

export default function FeedPage() {
  const router = useRouter();
  const [feedData, setFeedData] = useState<FeedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [username, setUsername] = useState('Veronica');

  // Cargar datos del feed
  const loadFeedData = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener nombre de usuario del localStorage si existe
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user.username) setUsername(user.username);
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
      }

      const data = await getFeedItems(page, itemsPerPage);
      setFeedData(data);
      setCurrentPage(page);
      
      // Scroll suave hacia arriba al cambiar de página
      if (typeof window !== 'undefined' && page !== 1) {
        window.scrollTo({ top: 400, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Error cargando feed:', err);
      setError('No se pudieron cargar los datos del feed. Por favor, verifica tu conexión con el backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadFeedData(1);
  }, []);

  // Separar elementos por estado (Pending vs Ongoing/In Progress)
  const getPendingItems = (): FeedItem[] => 
    feedData?.data?.filter((item) => item.status === 'pending') || [];
  
  const getOngoingItems = (): FeedItem[] => 
    feedData?.data?.filter((item) => item.status === 'in_progress' || item.status === 'completed') || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar />
      
      <main className="flex-1">
        <Hero isDashboard={true} username={username} />

        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Estado de carga */}
          {loading && !feedData && (
            <div className="flex flex-col justify-center items-center py-20 gap-4">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="text-gray-500 animate-pulse">Loading your learning adventure...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="alert alert-error shadow-lg mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
              <div>
                <button className="btn btn-sm btn-ghost" onClick={() => loadFeedData(currentPage)}>Retry</button>
              </div>
            </div>
          )}

          {/* Feed Content */}
          {feedData && !loading && (
            <div className="space-y-16">
              {/* Sección Pending */}
              <section>
                <h2 className="text-3xl font-bold text-gray-800 mb-8 border-l-4 border-pink-500 pl-4">Pending</h2>
                {getPendingItems().length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {getPendingItems().map((item) => (
                      <Card key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 italic">No pending units at the moment.</p>
                  </div>
                )}
              </section>

              {/* Sección Ongoing */}
              <section>
                <h2 className="text-3xl font-bold text-gray-800 mb-8 border-l-4 border-teal-500 pl-4">Ongoing</h2>
                {getOngoingItems().length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {getOngoingItems().map((item) => (
                      <Card key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 italic">No ongoing activities. Pick a unit to start!</p>
                  </div>
                )}
              </section>

              {/* Paginación Estilo DaisyUI */}
              {feedData.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 py-8">
                  <div className="join shadow-sm border border-gray-200">
                    <button
                      onClick={() => loadFeedData(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                      className="join-item btn btn-outline btn-sm px-4"
                    >
                      «
                    </button>
                    
                    {Array.from({ length: feedData.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => loadFeedData(page)}
                        disabled={loading}
                        className={`join-item btn btn-sm ${page === currentPage ? 'btn-primary text-white' : 'btn-outline'}`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => loadFeedData(currentPage + 1)}
                      disabled={currentPage === feedData.totalPages || loading}
                      className="join-item btn btn-outline btn-sm px-4"
                    >
                      »
                    </button>
                  </div>
                  <div className="text-sm text-gray-500 font-medium">
                    Page <span className="text-gray-800">{currentPage}</span> of {feedData.totalPages}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Empty State */}
          {!loading && feedData && feedData.data.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-2xl font-bold text-gray-800">No content found</h3>
                <p className="text-gray-500 mt-2">Your dashboard seems to be empty. Please check back later!</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
