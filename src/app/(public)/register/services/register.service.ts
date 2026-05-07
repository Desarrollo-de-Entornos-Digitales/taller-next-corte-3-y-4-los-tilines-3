import axiosClient from '@/lib/axios/client';

class RegisterService {
    async register(email: string, password: string, username: string, bio: string = '') {
        const result = await axiosClient.post('/auth/register', {
            email,
            password,
            username,
            bio,
        });
        return result.data;
    }
}

export const registerService = new RegisterService();
