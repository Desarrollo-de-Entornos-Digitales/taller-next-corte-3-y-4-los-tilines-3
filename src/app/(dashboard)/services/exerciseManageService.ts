import axiosClient from '../../../lib/axios/client';

export interface CreateExerciseDto {
    module_id: number;
    title: string;
    description: string;
    exercise_type: 'MULTIPLE_CHOICE' | 'CODING' | 'TRUE_FALSE';
    difficulty_level: number;
    points: number;
    explanation: string;
    starterCode?: string;
    solutionCode?: string;
}

export interface CreateExerciseOptionDto {
    exercise_id: number;
    option_text: string;
    is_correct: boolean;
}

export interface ExerciseOption {
    id: number;
    exercise_id: number;
    option_text: string;
    is_correct: boolean;
}

export interface CreateExerciseAttemptsDto {
    user_id: number;
    exercise_id: number;
    answerd_submited: string;
    is_correct: boolean;
    feedback: string;
    score: number;
    attempt_date: string;
}

export interface UpdateExerciseDto extends Partial<CreateExerciseDto> {}

export interface Exercise {
    id: number;
    module_id: number;
    title: string;
    description: string;
    exercise_type: string;
    difficulty_level: number;
    points: number;
    explanation: string;
    starterCode?: string;
    solutionCode?: string;
}

export const getExercises = async (): Promise<Exercise[]> => {
    const response = await axiosClient.get('/exercise');
    return response.data;
};

export const getExerciseById = async (id: number): Promise<Exercise> => {
    const response = await axiosClient.get(`/exercise/${id}`);
    return response.data;
};

export const createExercise = async (data: CreateExerciseDto): Promise<Exercise> => {
    const payload: any = { ...data };
    if (data.starterCode || data.solutionCode) {
        payload.content_payload = {
            starterCode: data.starterCode,
            solutionCode: data.solutionCode,
        };
    }
    delete payload.starterCode;
    delete payload.solutionCode;

    const response = await axiosClient.post('/exercise', payload);
    return response.data;
};

export const updateExercise = async (id: number, data: UpdateExerciseDto): Promise<Exercise> => {
    const payload: any = { ...data };
    if (data.starterCode || data.solutionCode) {
        payload.content_payload = {
            starterCode: data.starterCode,
            solutionCode: data.solutionCode,
        };
    }
    delete payload.starterCode;
    delete payload.solutionCode;

    const response = await axiosClient.put(`/exercise/${id}`, payload);
    return response.data;
};

export const deleteExercise = async (id: number): Promise<void> => {
    await axiosClient.delete(`/exercise/${id}`);
};

export const getExerciseOptions = async (exerciseId: number): Promise<ExerciseOption[]> => {
    const response = await axiosClient.get(`/exercise-options/exercise/${exerciseId}`);
    return response.data;
};

export const createExerciseOption = async (data: CreateExerciseOptionDto): Promise<ExerciseOption> => {
    const response = await axiosClient.post('/exercise-options', data);
    return response.data;
};

export const updateExerciseOption = async (
    id: number,
    data: Partial<CreateExerciseOptionDto>,
): Promise<ExerciseOption> => {
    const response = await axiosClient.put(`/exercise-options/${id}`, data);
    return response.data;
};

export const deleteExerciseOption = async (id: number): Promise<void> => {
    await axiosClient.delete(`/exercise-options/${id}`);
};

export const createExerciseAttempt = async (data: CreateExerciseAttemptsDto): Promise<any> => {
    const response = await axiosClient.post('/exercise-attempts', data);
    return response.data;
};
