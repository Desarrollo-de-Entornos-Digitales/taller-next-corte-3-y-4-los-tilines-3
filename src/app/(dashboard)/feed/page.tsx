'use client';

import { useEffect, useState } from 'react';
import { getFeedItems, FeedItem, FeedResponse } from '../services/feedService';
import Card from '../../../components/Card';
import NavBar from '../../../components/NavBar';
import Hero from '../../../components/Hero';

export default function FeedPage() {
  const [feedData, setFeedData] = useState<FeedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  // Cargar datos del feed
  const loadFeedData = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Obtener courseId y studentId del JWT
      const courseId = localStorage.getItem('courseId') || 1;
      const studentId = localStorage.getItem('studentId') || 1;
      const data = await getFeedItems(page, itemsPerPage, courseId, studentId);
      setFeedData(data);
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error cargando feed:', err);
      setError('No se pudieron cargar los datos del feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedData(1);
  }, []);

  const handleItemClick = (item: FeedItem) => {
    console.log('Item seleccionado:', {
      id: item.id,
      title: item.title,
      status: item.status,
      timestamp: new Date().toISOString(),
    });
  };

  // Separar elementos por estado
  const getPendingItems = (): FeedItem[] => feedData?.data.filter((item) => item.status === 'pending') || [];
  const getInProgressItems = (): FeedItem[] => feedData?.data.filter((item) => item.status === 'in_progress') || [];
  const getCompletedItems = (): FeedItem[] => feedData?.data.filter((item) => item.status === 'completed') || [];

  return (
    <div>
      <NavBar />
      <Hero isDashboard={true} description="Ready to solve something new today?" />

      <main className="px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Estado de carga */}
          {loading && !feedData && (
            <div className="flex justify-center items-center py-12">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          {/* Feed sections */}
          {feedData && !loading && (
            <>
              {/* Pendientes */}
              {getPendingItems().length > 0 && (
                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-6">Pending</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getPendingItems().map((item) => (
                      <div key={item.id} onClick={() => handleItemClick(item)} className="cursor-pointer">
                        <Card item={item} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* En progreso */}
              {getInProgressItems().length > 0 && (
                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-6">In Progress</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {getInProgressItems().map((item) => (
                      <div key={item.id} onClick={() => handleItemClick(item)} className="cursor-pointer">
                        <Card item={item} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Completados */}
              {getCompletedItems().length > 0 && (
                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-6">Completed</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {getCompletedItems().map((item) => (
                      <div key={item.id} onClick={() => handleItemClick(item)} className="cursor-pointer bg-amber-400">
                        <Card item={item} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Mensaje si no hay elementos */}
              {feedData.data.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-lg text-gray-500">No hay elementos disponibles</p>
                </div>
              )}

              {/* Paginación */}
              {feedData.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 my-8">
                  <button
                    onClick={() => loadFeedData(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="btn btn-outline"
                  >
                    Anterior
                  </button>

                  <div className="join">
                    {Array.from({ length: feedData.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => loadFeedData(page)}
                        disabled={loading}
                        className={`join-item btn ${page === currentPage ? 'btn-active' : ''}`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => loadFeedData(currentPage + 1)}
                    disabled={currentPage === feedData.totalPages || loading}
                    className="btn btn-outline"
                  >
                    Siguiente
                  </button>

                  <span className="ml-4 text-sm text-gray-600">
                    Página {currentPage} de {feedData.totalPages}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
