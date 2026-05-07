// 1. src/app/(dashboard)/services/courseService.ts
import axiosClient from '../../../lib/axios/client';

export interface Course {
  id: number;
  name: string;
  description: string;
}

export interface Enrollment {
  id: number;
  course_id: number;
  user_id: number;
  courses: Course; // El backend devuelve la relación en plural 'courses'
}

/**
 * Obtener cursos en los que el usuario está inscrito
 */
export const getMyEnrollments = async (userId: number): Promise<Enrollment[]> => {
  try {
    const response = await axiosClient.get<Enrollment[]>(`/courses-enrollments/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    throw error;
  }
};
