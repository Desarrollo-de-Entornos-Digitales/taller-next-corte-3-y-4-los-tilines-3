const API_URL = 'http://localhost:3001';

export interface Achievement {
    id: number;
    name: string;
    description: string;
    points_required: number;
}

export interface UserAchievement {
    id: number;
    user_id: number;
    achievement_id: number;
    achievement: Achievement;
}

export const achievementsService = {
    getAllAchievements: async (token: string): Promise<Achievement[]> => {
        try {
            const response = await fetch(`${API_URL}/achievement`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch achievements');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching achievements:', error);
            return [];
        }
    },

    getUserAchievements: async (userId: number, token: string): Promise<UserAchievement[]> => {
        try {
            const response = await fetch(`${API_URL}/user-achievement/user/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user achievements');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching user achievements:', error);
            return [];
        }
    },
};
