import { getMyEnrollments } from '@/app/(dashboard)/services/courseService';
import { getCourseLearningHub, getExerciseTypeLabel } from '@/app/(dashboard)/services/exerciseService';
import { FeedItem, getFeedItems } from '@/app/(dashboard)/services/feedService';

export type ProfileTaskStatus = 'pending' | 'in_progress';

const typeColors: Record<string, string> = {
    MULTIPLE_CHOICE: '#E9539A', // Pink
    CODING: '#953DF1', // Purple
    ORDER: '#FFB800', // Yellow
    SYNTAX: '#37CDB2', // Turquoise
    DEFAULT: '#4A86F7', // Blue
};

const getExerciseColor = (type?: string) => typeColors[type?.toUpperCase() ?? ''] || typeColors.DEFAULT;

export interface ProfileUpcomingTask {
    id: string;
    title: string;
    type: string;
    courseName: string;
    moduleName: string;
    status: ProfileTaskStatus;
    href: string;
    dateLabel?: string;
    color?: string;
}

export interface ProfileRecentActivity {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    href?: string;
    icon?: 'check' | 'star' | 'play';
    color?: string;
}

export interface ProfileStats {
    activeUnits: number;
    averageProgress: number;
    completedExercises: number;
    totalExercises: number;
}

export interface ProfileOverview {
    stats: ProfileStats;
    upcomingTasks: ProfileUpcomingTask[];
    recentActivity: ProfileRecentActivity[];
}

const normalizeFeedTasks = (items: FeedItem[], courseId?: number): ProfileUpcomingTask[] => {
    return items
        .filter((item) => item.status === 'pending' || item.status === 'in_progress')
        .map((item, index) => {
            const dates = ['Mañana', '16/sep', '20/nov', 'Pronto'];
            return {
                id: `feed-task-${courseId ?? 0}-${item.id}`,
                title: item.title,
                type: 'Ejercicio',
                courseName: courseId ? `Curso ${courseId}` : 'Ruta general',
                moduleName: 'Feed',
                status: item.status as ProfileTaskStatus,
                href: courseId ? `/ejercicios/course/${courseId}/module/${item.id}` : '/feed',
                dateLabel: dates[index % dates.length],
                color: getExerciseColor('CODING'),
            };
        });
};

const normalizeFeedActivity = (items: FeedItem[], courseId?: number): ProfileRecentActivity[] => {
    const activities: ProfileRecentActivity[] = [];

    items
        .filter((item) => item.status === 'completed')
        .forEach((item, index) => {
            activities.push({
                id: `feed-activity-${courseId ?? 0}-${item.id}`,
                title: `Completaste "${item.title}"`,
                description: courseId ? `Curso ${courseId} · Feed` : 'Feed',
                createdAt: new Date(Date.now() - index * 60000).toISOString(),
                href: courseId ? `/ejercicios/course/${courseId}/module/${item.id}` : '/feed',
                icon: 'check',
                color: typeColors.CODING,
            });

            activities.push({
                id: `feed-pts-${courseId ?? 0}-${item.id}`,
                title: 'Obtuviste 25 puntos',
                description: `Puntos de feed por "${item.title}"`,
                createdAt: new Date(Date.now() - (index + 0.1) * 60000).toISOString(),
                icon: 'star',
                color: typeColors.ORDER,
            });
        });

    return activities;
};

export const getProfileOverview = async (userId: number): Promise<ProfileOverview> => {
    const enrollments = await getMyEnrollments(userId).catch(() => []);

    const hubs = (
        await Promise.all(
            enrollments.map(async (enrollment) => {
                try {
                    const hub = await getCourseLearningHub(enrollment.course_id, userId);
                    return {
                        courseId: enrollment.course_id,
                        courseName: enrollment.courses?.name ?? hub.course.name,
                        hub,
                    };
                } catch {
                    return null;
                }
            }),
        )
    ).filter((item): item is NonNullable<typeof item> => item !== null);

    const stats: ProfileStats = {
        activeUnits: hubs.reduce((sum, item) => sum + item.hub.modules.filter(m => m.caminoState !== 'locked').length, 0),
        averageProgress:
            hubs.length > 0
                ? Math.min(100, Math.round(hubs.reduce((sum, item) => sum + item.hub.overallProgress, 0) / hubs.length))
                : 0,
        completedExercises: hubs.reduce((sum, item) => sum + item.hub.completedExercises, 0),
        totalExercises: hubs.reduce((sum, item) => sum + item.hub.totalExercises, 0),
    };

    const upcomingTasks: ProfileUpcomingTask[] = [];
    const recentActivity: ProfileRecentActivity[] = [];

    let activityIndex = 0;

    for (const item of hubs) {
        const sortedModules = [...item.hub.modules].sort((a, b) => a.level_order - b.level_order);

        for (const learningModule of sortedModules) {
            if (learningModule.caminoState !== 'locked') {
                for (const exercise of learningModule.exercises) {
                    const typeLabel = getExerciseTypeLabel(exercise.exercise_type);
                    const exerciseColor = getExerciseColor(exercise.exercise_type);

                    if (!exercise.completed) {
                        const dates = ['Mañana', '15/jun', '18/jun', '25/jun'];
                        upcomingTasks.push({
                            id: `task-${item.courseId}-${learningModule.id}-${exercise.id}`,
                            title: exercise.title,
                            type: typeLabel,
                            courseName: item.courseName,
                            moduleName: learningModule.title,
                            status: learningModule.status === 'in_progress' ? 'in_progress' : 'pending',
                            href: `/ejercicios/arena/${exercise.id}?courseId=${item.courseId}&moduleId=${learningModule.id}`,
                            dateLabel: dates[upcomingTasks.length % dates.length],
                            color: exerciseColor,
                        });
                    } else {
                        recentActivity.push({
                            id: `activity-done-${item.courseId}-${learningModule.id}-${exercise.id}`,
                            title: `Completaste "${exercise.title}"`,
                            description: `${item.courseName} · ${learningModule.title}`,
                            createdAt: new Date(Date.now() - activityIndex * 60000).toISOString(),
                            href: `/ejercicios/arena/${exercise.id}?courseId=${item.courseId}&moduleId=${learningModule.id}`,
                            icon: 'check',
                            color: exerciseColor,
                        });

                        recentActivity.push({
                            id: `activity-pts-${item.courseId}-${learningModule.id}-${exercise.id}`,
                            title: `Obtuviste ${exercise.points} puntos`,
                            description: `Recompensa por "${exercise.title}"`,
                            createdAt: new Date(Date.now() - (activityIndex + 0.1) * 60000).toISOString(),
                            icon: 'star',
                            color: typeColors.ORDER,
                        });

                        activityIndex += 1;
                    }
                }
            }
        }
    }

    upcomingTasks.sort((a, b) => {
        if (a.status !== b.status) {
            return a.status === 'in_progress' ? -1 : 1;
        }
        return a.title.localeCompare(b.title);
    });

    let mergedTasks = upcomingTasks;
    let mergedRecent = recentActivity;
    let mergedStats = stats;

    const feedData = await getFeedItems(1, 18).catch(() => null);

    if (feedData) {
        const feedTasks = normalizeFeedTasks(feedData.data, feedData.course_id);
        const feedActivity = normalizeFeedActivity(feedData.data, feedData.course_id);

        const taskById = new Map<string, ProfileUpcomingTask>();
        for (const task of mergedTasks) taskById.set(task.id, task);
        for (const task of feedTasks) taskById.set(task.id, task);

        const activityById = new Map<string, ProfileRecentActivity>();
        for (const activity of mergedRecent) activityById.set(activity.id, activity);
        for (const activity of feedActivity) activityById.set(activity.id, activity);

        mergedTasks = Array.from(taskById.values());
        mergedRecent = Array.from(activityById.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        if (hubs.length === 0) {
            const totalItems = feedData.data.length;
            const progressAvg =
                totalItems > 0
                    ? Math.round(feedData.data.reduce((sum, item) => sum + (item.progress ?? 0), 0) / totalItems)
                    : 0;
            const completedCount = feedData.data.filter((item) => item.status === 'completed').length;

            mergedStats = {
                activeUnits: feedData.course_id ? 1 : 0,
                averageProgress: progressAvg,
                completedExercises: completedCount,
                totalExercises: feedData.total || totalItems,
            };
        } else {
            // Merge feed stats into existing hub stats for a global view
            const totalItems = feedData.data.length;
            const feedProgressSum = feedData.data.reduce((sum, item) => sum + (item.progress ?? 0), 0);
            const feedCompleted = feedData.data.filter((item) => item.status === 'completed').length;

            const totalUnitsCount = stats.activeUnits + (feedData.course_id ? 1 : 0);
            const totalProgressSum =
                hubs.reduce((sum, item) => sum + item.hub.overallProgress, 0) +
                (totalItems > 0 ? feedProgressSum / totalItems : 0);

            mergedStats = {
                activeUnits: totalUnitsCount,
                averageProgress:
                    totalUnitsCount > 0 ? Math.min(100, Math.round(totalProgressSum / hubs.length)) : 0,
                completedExercises: stats.completedExercises + feedCompleted,
                totalExercises: stats.totalExercises + (feedData.total || totalItems),
            };
        }
    }

    mergedTasks.sort((a, b) => {
        if (a.status !== b.status) {
            return a.status === 'in_progress' ? -1 : 1;
        }
        return a.title.localeCompare(b.title);
    });

    return {
        stats: mergedStats,
        upcomingTasks: mergedTasks.slice(0, 8),
        recentActivity: mergedRecent.slice(0, 8),
    };
};
