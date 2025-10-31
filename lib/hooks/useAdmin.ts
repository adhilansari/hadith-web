'use client';

import { useState, useEffect } from 'react';

interface AdminState {
    isAuthenticated: boolean;
    isLoading: boolean;
}

const ADMIN_STORAGE_KEY = 'hadith_admin_auth';
const ADMIN_USERNAME = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

export function useAdmin() {
    const [adminState, setAdminState] = useState<AdminState>({
        isAuthenticated: false,
        isLoading: true,
    });

    useEffect(() => {
        const checkAuth = () => {
            try {
                const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
                if (stored) {
                    const { expiry } = JSON.parse(stored);
                    if (Date.now() < expiry) {
                        setAdminState({ isAuthenticated: true, isLoading: false });
                        return;
                    }
                }
            } catch (error) {
                console.error('Auth check failed:', error);
            }
            setAdminState({ isAuthenticated: false, isLoading: false });
        };

        checkAuth();
    }, []);

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            console.log('Attempting login with:', { username, password });
            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                const token = btoa(`${username}:${Date.now()}`);
                const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

                localStorage.setItem(
                    ADMIN_STORAGE_KEY,
                    JSON.stringify({ token, expiry })
                );

                setAdminState({ isAuthenticated: true, isLoading: false });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem(ADMIN_STORAGE_KEY);
        setAdminState({ isAuthenticated: false, isLoading: false });
    };

    return {
        ...adminState,
        login,
        logout,
    };
}