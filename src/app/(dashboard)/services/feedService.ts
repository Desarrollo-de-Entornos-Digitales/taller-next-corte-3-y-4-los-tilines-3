// 2. src/app/(dashboard)/services/feedService.ts
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
    course_id?: number;
}

/**
 * Obtener módulos con paginación y filtro por curso
 */
export const getFeedItems = async (page: number = 1, limit: number = 6, courseId?: number): Promise<FeedResponse> => {
    try {
        const response = await axiosClient.get<FeedResponse>(`/modules/my-modules`, {
            params: {
                page,
                limit,
                ...(courseId && { course_id: courseId }), // El backend usa course_id
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching feed items:', error);
        throw error;
    }
};
