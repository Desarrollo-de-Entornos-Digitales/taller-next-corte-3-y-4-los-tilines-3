'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
    id: number;
    username: string;
    email: string;
    roleName?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAdmin: boolean;
    isProfessor: boolean;
    isStudent: boolean;
    canManageCourses: boolean;
    logout: () => void;
    setAuthData: (token: string, user: User) => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    isAdmin: false,
    isProfessor: false,
    isStudent: false,
    canManageCourses: false,
    logout: () => {},
    setAuthData: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // Hydrate from localStorage on mount
        const storedToken = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');
        if (storedToken) setToken(storedToken);
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                // ignore parse errors
            }
        }
    }, []);

    const setAuthData = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('access_token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
    };

    const roleName = user?.roleName?.toLowerCase() ?? '';
    const isAdmin = roleName === 'admin';
    const isProfessor = roleName === 'professor' || roleName === 'profesor';
    const isStudent = roleName === 'user' || roleName === 'student' || roleName === 'estudiante';
    const canManageCourses = isAdmin || isProfessor;

    return (
        <AuthContext.Provider
            value={{ user, token, isAdmin, isProfessor, isStudent, canManageCourses, logout, setAuthData }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
