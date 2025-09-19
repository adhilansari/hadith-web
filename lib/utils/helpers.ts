// lib/utils/helpers.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatHadithNumber(num: number): string {
    return num.toString().padStart(4, '0');
}

export function extractBookName(fullName: string): string {
    // Extract clean book name from API response
    return fullName.replace(/^(Sunan|Sahih|Jami)\s+/, '').trim();
}

export function isRTL(text: string): boolean {
    // Simple RTL detection for Arabic/Urdu text
    const rtlChars = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    return rtlChars.test(text);
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

export function getGradeColor(grade: string): string {
    const lowerGrade = grade.toLowerCase();

    if (lowerGrade.includes('sahih')) return 'green';
    if (lowerGrade.includes('hasan')) return 'yellow';
    if (lowerGrade.includes('daif') || lowerGrade.includes('weak')) return 'red';
    return 'gray';
}

export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
}

export function generateBookSlug(bookName: string): string {
    return bookName
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
}

// Storage utilities for client-side caching
export const storage = {
    get: (key: string) => {
        if (typeof window === 'undefined') return null;
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch {
            return null;
        }
    },

    set: (key: string, value: any) => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    },

    remove: (key: string) => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(key);
    },

    clear: () => {
        if (typeof window === 'undefined') return;
        localStorage.clear();
    }
};

// Theme utilities
export function applyTheme(theme: string) {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const themes = ['light', 'dark', 'blue', 'emerald', 'purple'];

    // Remove all theme classes
    root.classList.remove(...themes.map(t => `theme-${t}`), 'dark');

    if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        if (systemTheme === 'dark') root.classList.add('dark');
    } else if (theme === 'dark') {
        root.classList.add('dark');
    } else if (theme !== 'light') {
        root.classList.add('dark', `theme-${theme}`);
    }
}

// PWA utilities
export function isPWA(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
}

export function canInstallPWA(): boolean {
    if (typeof window === 'undefined') return false;
    return 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;
}