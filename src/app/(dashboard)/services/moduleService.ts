import axiosClient from '../../../lib/axios/client';

export interface ModuleEntity {
    id: number;
    title: string;
    description: string;
    level_order: number;
    course_id?: number;
}

export interface CreateModuleDto {
    title: string;
    description: string;
    level_order: number;
    course_id: number;
}

export interface UpdateModuleDto {
    title?: string;
    description?: string;
    level_order?: number;
    course_id?: number;
}

class ModuleService {
    async getAll(): Promise<ModuleEntity[]> {
        const response = await axiosClient.get<ModuleEntity[]>('/modules');
        return response.data;
    }

    async getById(id: number): Promise<ModuleEntity> {
        const response = await axiosClient.get<ModuleEntity>(`/modules/${id}`);
        return response.data;
    }

    async create(data: CreateModuleDto): Promise<ModuleEntity> {
        const response = await axiosClient.post<ModuleEntity>('/modules', data);
        return response.data;
    }

    async update(id: number, data: UpdateModuleDto): Promise<ModuleEntity> {
        const response = await axiosClient.patch<ModuleEntity>(`/modules/${id}`, data);
        return response.data;
    }

    async remove(id: number): Promise<{ message: string }> {
        const response = await axiosClient.delete<{ message: string }>(`/modules/${id}`);
        return response.data;
    }
}

export const moduleService = new ModuleService();
