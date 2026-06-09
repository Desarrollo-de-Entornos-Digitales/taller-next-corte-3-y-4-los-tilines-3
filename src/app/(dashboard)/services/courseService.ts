import axiosClient from '../../../lib/axios/client';

export interface Course {
    id: number;
    name: string;
    description: string;
    professor_id: number;
    created_at: string;
}

export interface CreateCourseData {
    name: string;
    description: string;
    professor_id: number;
}

export interface UpdateCourseData {
    name?: string;
    description?: string;
    professor_id?: number;
}

export interface Enrollment {
    id: number;
    user_id: number;
    course_id: number;
    courses: Course;
}

class CourseService {
    async getAll(): Promise<Course[]> {
        const response = await axiosClient.get<Course[]>('/courses');
        return response.data;
    }

    async getById(id: number): Promise<Course> {
        const response = await axiosClient.get<Course>(`/courses/${id}`);
        return response.data;
    }

    async create(data: CreateCourseData): Promise<Course> {
        const response = await axiosClient.post<Course>('/courses', {
            title: data.name,
            description: data.description,
            professor_id: data.professor_id,
        });
        return response.data;
    }

    async update(id: number, data: UpdateCourseData, actorId: number): Promise<Course> {
        const body: Record<string, unknown> = {
            professor_id: actorId,
        };

        if (data.name !== undefined) {
            body.title = data.name;
        }
        if (data.description !== undefined) {
            body.description = data.description;
        }
        if (data.professor_id !== undefined) {
            body.professor_id = data.professor_id;
        }

        const response = await axiosClient.patch<Course>(`/courses/${id}`, body);
        return response.data;
    }

    async remove(id: number, professorId: number): Promise<{ message: string }> {
        const response = await axiosClient.delete<{ message: string }>(
            `/courses/${id}/soft-remove?professor_id=${professorId}`,
        );
        return response.data;
    }
}

export const courseService = new CourseService();

export const getMyEnrollments = async (userId: number): Promise<Enrollment[]> => {
    try {
        const response = await axiosClient.get<Enrollment[]>(`/courses-enrollments/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching enrollments:', error);
        throw error;
    }
};

export const joinGroup = async (courseId: number, userId: number): Promise<void> => {
    try {
        await axiosClient.post('/courses-enrollments', {
            course_id: courseId,
            user_id: userId
        });
    } catch (error) {
        console.error('Error joining group:', error);
        throw error;
    }
};
