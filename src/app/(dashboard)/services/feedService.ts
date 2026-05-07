import axiosClient from '../../../lib/axios/client';

export interface FeedItem {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
  image?: string;
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
 */
export const getFeedItems = async (
  page: number = 1,
  limit: number = 6
): Promise<FeedResponse> => {
  try {
    const response = await axiosClient.get<FeedResponse>(
      `/modules/my-modules`,
      {
        params: {
          page,
          limit,
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
 * Obtener módulos por curso
 */
export const getFeedItemsByCourse = async (
  courseId: number,
  page: number = 1,
  limit: number = 6
): Promise<FeedResponse> => {
  try {
    const response = await axiosClient.get<FeedResponse>(
      `/modules/my-modules`,
      {
        params: {
          course_id: courseId,
          page,
          limit,
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching feed items:', error);
    throw error;
  }
};
