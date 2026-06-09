import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { ProfileRecentActivity, ProfileUpcomingTask, ProfileStats } from '@/app/(dashboard)/services/profileService';

const MAX_RECENT_ITEMS = 20;

export interface ProfileActivityInput {
    title: string;
    description: string;
    href?: string;
    createdAt?: string;
    icon?: 'check' | 'star' | 'play';
    color?: string;
}

interface ProfileStore {
    stats: ProfileStats | null;
    tasks: ProfileUpcomingTask[];
    loadingTasks: boolean;
    tasksError: string | null;
    recentActivity: ProfileRecentActivity[];
    setStats: (stats: ProfileStats) => void;
    setTasks: (tasks: ProfileUpcomingTask[]) => void;
    setLoadingTasks: (loading: boolean) => void;
    setTasksError: (error: string | null) => void;
    mergeRecentActivity: (items: ProfileRecentActivity[]) => void;
    addRecentActivity: (item: ProfileActivityInput) => void;
    clearRecentActivity: () => void;
}

export const useProfileStore = create<ProfileStore>()(
    persist(
        (set) => ({
            stats: null,
            tasks: [],
            loadingTasks: false,
            tasksError: null,
            recentActivity: [],
            setStats: (stats) => set({ stats }),
            setTasks: (tasks) => set({ tasks }),
            setLoadingTasks: (loadingTasks) => set({ loadingTasks }),
            setTasksError: (tasksError) => set({ tasksError }),
            mergeRecentActivity: (items) =>
                set((state) => {
                    const byId = new Map<string, ProfileRecentActivity>();

                    for (const item of state.recentActivity) {
                        byId.set(item.id, item);
                    }
                    for (const item of items) {
                        byId.set(item.id, item);
                    }

                    const merged = Array.from(byId.values()).sort(
                        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
                    );

                    return {
                        recentActivity: merged.slice(0, MAX_RECENT_ITEMS),
                    };
                }),
            addRecentActivity: (item) =>
                set((state) => {
                    const activity: ProfileRecentActivity = {
                        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                        title: item.title,
                        description: item.description,
                        href: item.href,
                        createdAt: item.createdAt ?? new Date().toISOString(),
                        icon: item.icon,
                        color: item.color,
                    };

                    return {
                        recentActivity: [activity, ...state.recentActivity].slice(0, MAX_RECENT_ITEMS),
                    };
                }),
            clearRecentActivity: () => set({ recentActivity: [] }),
        }),
        {
            name: 'otly-profile-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ recentActivity: state.recentActivity }),
        },
    ),
);
