import axiosClient from '../../lib/axios/client';

export interface Role {
  id: number;
  name: string;
  description: string;
}

export const getRoles = async (): Promise<Role[]> => {
  try {
    const response = await axiosClient.get<Role[]>('/roles');
    return response.data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    return [];
  }
};
