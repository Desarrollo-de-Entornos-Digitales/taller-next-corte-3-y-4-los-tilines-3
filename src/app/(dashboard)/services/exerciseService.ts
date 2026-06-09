import axiosClient from '../../../lib/axios/client';

export type ExerciseType = 'MULTIPLE_CHOICE' | 'CODING' | 'ORDER' | 'SYNTAX';

export interface ArenaExerciseOption {
    id: number;
    label: string;
}

export interface ArenaCodeLine {
    id: number;
    text: string;
}

export interface ArenaExercise {
    id: number;
    module_id: number | null;
    title: string;
    description: string;
    exercise_type: ExerciseType;
    difficulty_level: number;
    points: number;
    explanation: string;
    options?: ArenaExerciseOption[];
    starterCode?: string;
    language?: string;
    orderLines?: string[];
    syntaxLines?: ArenaCodeLine[];
}

export interface SubmitExerciseResult {
    correct: boolean;
    score: number;
    feedback: string;
    explanation: string;
    pointsEarned: number;
    newlyUnlockedAchievements?: any[];
}

export interface LearningExerciseSummary {
    id: number;
    title: string;
    description: string;
    exercise_type: string;
    difficulty_level: number;
    points: number;
    completed?: boolean;
}

export interface LearningModule {
    id: number;
    title: string;
    description: string;
    level_order: number;
    exerciseCount: number;
    exercisesCompleted?: number;
    progress: number;
    status: 'pending' | 'in_progress' | 'completed';
    caminoState: 'done' | 'current' | 'locked';
    exercises: LearningExerciseSummary[];
}

export interface CourseLearningHub {
    course: {
        id: number;
        name: string;
        description: string;
    };
    overallProgress: number;
    totalExercises: number;
    completedExercises: number;
    modules: LearningModule[];
}

export interface ModuleDetail {
    id: number;
    title: string;
    description: string;
    level_order: number;
    course_id: number;
    exercises?: { id: number; title: string; exercise_type: string; points: number }[];
}

const exerciseTypeLabel: Record<string, string> = {
    MULTIPLE_CHOICE: 'Quiz',
    CODING: 'Editor',
    ORDER: 'Ordena',
    SYNTAX: 'Detective',
};

export const getExerciseTypeLabel = (type: string) => exerciseTypeLabel[type.toUpperCase()] ?? type;

export const getCourseLearningHub = async (courseId: number, userId?: number): Promise<CourseLearningHub> => {
    const response = await axiosClient.get<CourseLearningHub>(`/modules/course/${courseId}/learning`, {
        params: userId ? { user_id: userId } : undefined,
    });
    return response.data;
};

export const getModuleById = async (moduleId: number): Promise<ModuleDetail> => {
    const response = await axiosClient.get<ModuleDetail>(`/modules/${moduleId}`);
    return response.data;
};

export const getArenaExercisesByModule = async (moduleId: number): Promise<ArenaExercise[]> => {
    const response = await axiosClient.get<ArenaExercise[]>(`/exercise/module/${moduleId}/arena`);
    return response.data;
};

export const getArenaExercise = async (exerciseId: number): Promise<ArenaExercise> => {
    const response = await axiosClient.get<ArenaExercise>(`/exercise/${exerciseId}/arena`);
    return response.data;
};

export const submitExerciseAnswer = async (
    exerciseId: number,
    userId: number,
    answer: string,
): Promise<SubmitExerciseResult> => {
    const response = await axiosClient.post<SubmitExerciseResult>(`/exercise/${exerciseId}/submit`, {
        user_id: userId,
        answer,
    });
    return response.data;
};

export const shuffle = <T>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
};
