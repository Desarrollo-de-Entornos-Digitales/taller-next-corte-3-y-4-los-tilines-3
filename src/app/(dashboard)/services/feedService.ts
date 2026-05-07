import axiosClient from '../../../lib/axios/client';

/**
 * ACTUALIZADO: Conecta con el endpoint real del backend
 * GET /modules/my-modules?page=1&limit=6
 * 
 * El backend extrae automáticamente:
 * - user_id del JWT (token)
 * - student_id de la BD
 * - course_id (primer curso inscrito)
 */

export interface FeedItem {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
}

export interface FeedResponse {
  data: FeedItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Obtener módulos del estudiante autenticado
 * Solo necesita el token en localStorage
 */
export const getFeedItems = async (
  page: number = 1,
  limit: number = 6
): Promise<FeedResponse> => {
  try {
    // Obtener token del localStorage
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    // Llamar al endpoint real
    const response = await axiosClient.get<FeedResponse>(
      `/modules/my-modules`,
      {
        params: {
          page,
          limit,
        },
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching feed items:', error);
    throw error;
  }
};

/**
 * Opcional: Si quieres un curso específico
 */
export const getFeedItemsByCourse = async (
  courseId: number,
  page: number = 1,
  limit: number = 6
): Promise<FeedResponse> => {
  try {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await axiosClient.get<FeedResponse>(
      `/modules/my-modules`,
      {
        params: {
          course_id: courseId,
          page,
          limit,
        },
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching feed items:', error);
    throw error;
  }
};
