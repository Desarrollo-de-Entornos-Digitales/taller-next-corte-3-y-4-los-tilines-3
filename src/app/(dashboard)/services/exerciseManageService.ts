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
      solutionCode: data.solutionCode
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
      solutionCode: data.solutionCode
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
