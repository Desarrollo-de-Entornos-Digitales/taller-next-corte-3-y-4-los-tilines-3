import axiosClient from '../../../lib/axios/client';
import { Achievement } from './achievementsService';

export interface CreateAchievementDto {
    name: string;
    description: string;
    points_required: number;
}

export interface UpdateAchievementDto {
    name?: string;
    description?: string;
    points_required?: number;
}

export const achievementsManageService = {
    getAll: async (): Promise<Achievement[]> => {
        const response = await axiosClient.get<Achievement[]>('/achievement');
        return response.data;
    },

    create: async (data: CreateAchievementDto): Promise<Achievement> => {
        const response = await axiosClient.post<Achievement>('/achievement', data);
        return response.data;
    },

    update: async (id: number, data: UpdateAchievementDto): Promise<Achievement> => {
        const response = await axiosClient.put<Achievement>(`/achievement/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await axiosClient.delete(`/achievement/${id}`);
    }
};
