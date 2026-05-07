import axiosClient from '../../../../lib/axios/client';

class RegisterService {
    async register(username: string, email: string, password: string, bio: string, roleName: string) {
        // Mapeamos 'password' a 'passwordHash' porque así lo espera el DTO del backend
        const result = await axiosClient.post('/auth/register', {
            username,
            email,
            passwordHash: password,
            bio,
            roleName,
        });
        return result;
    }
}

export const registerService = new RegisterService();
