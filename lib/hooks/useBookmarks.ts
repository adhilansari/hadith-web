// lib/hooks/useBookmarks.ts - Fixed version
'use client';

import { useState, useEffect, useCallback } from 'react';
import { ICombinedHadith, IHadith } from '@/lib/types/hadith';

export interface Bookmark {
    id: string;
    hadithNumber: number;
    bookKey: string;
    bookName: string;
    sectionId?: string;
    sectionName?: string;
    hadithText: string;
    arabicText?: string;
    translation?: string;
    grade?: string;
    dateAdded: string;
    notes?: string;
    tags: string[];
}

const BOOKMARKS_KEY = 'hadith_bookmarks';
const MAX_BOOKMARKS = 1000;

export function useBookmarks() {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load bookmarks from localStorage
    useEffect(() => {
        const loadBookmarks = () => {
            try {
                const stored = localStorage.getItem(BOOKMARKS_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    // Validate and migrate old bookmark format if needed
                    const validBookmarks = Array.isArray(parsed)
                        ? parsed.filter(b => b.id && b.hadithNumber && b.bookKey)
                        : [];
                    setBookmarks(validBookmarks);
                }
            } catch (error) {
                console.error('Failed to load bookmarks:', error);
                setBookmarks([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadBookmarks();
    }, []);

    // Save bookmarks to localStorage
    const saveBookmarks = useCallback((newBookmarks: Bookmark[]) => {
        try {
            localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
            setBookmarks(newBookmarks);
        } catch (error) {
            console.error('Failed to save bookmarks:', error);
            throw new Error('Failed to save bookmark. Storage might be full.');
        }
    }, []);

    // Check if hadith is bookmarked - FIXED to use current bookmarks state
    const isBookmarked = useCallback((hadithId: string): boolean => {
        return bookmarks.some(b => b.id === hadithId);
    }, [bookmarks]);

    // Add bookmark
    const addBookmark = useCallback(async (
        hadith: ICombinedHadith | IHadith,
        bookKey: string,
        bookName: string,
        sectionId?: string,
        sectionName?: string
    ): Promise<boolean> => {
        try {
            // Create unique ID based on book and hadith number
            const hadithNumber = 'arabic' in hadith
                ? hadith.arabic?.hadithnumber
                : hadith.hadithnumber;

            const id = `${bookKey}-${hadithNumber}`;

            // Check if already bookmarked
            if (bookmarks.some(b => b.id === id)) {
                return false; // Already bookmarked
            }

            // Check bookmark limit
            if (bookmarks.length >= MAX_BOOKMARKS) {
                throw new Error(`Maximum ${MAX_BOOKMARKS} bookmarks allowed`);
            }

            // Extract hadith data based on type
            const isICombined = 'arabic' in hadith;

            const hadithText = isICombined
                ? (hadith as ICombinedHadith).translation?.text || 'No translation'
                : (hadith as IHadith).text || 'No text';

            const arabicText = isICombined
                ? (hadith as ICombinedHadith).arabic?.text
                : undefined;

            const grade = isICombined
                ? (hadith as ICombinedHadith).translation?.grades?.[0]?.grade
                : (hadith as IHadith).grades?.[0]?.grade;

            const newBookmark: Bookmark = {
                id,
                hadithNumber: hadithNumber || 0,
                bookKey,
                bookName,
                sectionId,
                sectionName,
                hadithText,
                arabicText,
                translation: hadithText,
                grade,
                dateAdded: new Date().toISOString(),
                notes: '',
                tags: []
            };

            const newBookmarks = [newBookmark, ...bookmarks];
            saveBookmarks(newBookmarks);
            return true;
        } catch (error) {
            console.error('Failed to add bookmark:', error);
            throw error;
        }
    }, [bookmarks, saveBookmarks]);

    // Remove bookmark
    const removeBookmark = useCallback((bookmarkId: string) => {
        const newBookmarks = bookmarks.filter(b => b.id !== bookmarkId);
        saveBookmarks(newBookmarks);
    }, [bookmarks, saveBookmarks]);

    // Toggle bookmark - FIXED logic
    const toggleBookmark = useCallback(async (
        hadith: ICombinedHadith | IHadith,
        bookKey: string,
        bookName: string,
        sectionId?: string,
        sectionName?: string
    ): Promise<boolean> => {
        const hadithNumber = 'arabic' in hadith
            ? hadith.arabic?.hadithnumber
            : hadith.hadithnumber;

        const id = `${bookKey}-${hadithNumber}`;

        // Use the current bookmarks state to check
        const currentlyBookmarked = bookmarks.some(b => b.id === id);

        if (currentlyBookmarked) {
            removeBookmark(id);
            return false; // Removed
        } else {
            await addBookmark(hadith, bookKey, bookName, sectionId, sectionName);
            return true; // Added
        }
    }, [bookmarks, addBookmark, removeBookmark]);

    // Get bookmark by ID
    const getBookmark = useCallback((hadithId: string): Bookmark | undefined => {
        return bookmarks.find(b => b.id === hadithId);
    }, [bookmarks]);

    // Update bookmark notes
    const updateBookmarkNotes = useCallback((bookmarkId: string, notes: string) => {
        const newBookmarks = bookmarks.map(b =>
            b.id === bookmarkId ? { ...b, notes } : b
        );
        saveBookmarks(newBookmarks);
    }, [bookmarks, saveBookmarks]);

    // Add/remove bookmark tags
    const updateBookmarkTags = useCallback((bookmarkId: string, tags: string[]) => {
        const newBookmarks = bookmarks.map(b =>
            b.id === bookmarkId ? { ...b, tags } : b
        );
        saveBookmarks(newBookmarks);
    }, [bookmarks, saveBookmarks]);

    // Clear all bookmarks
    const clearBookmarks = useCallback(() => {
        saveBookmarks([]);
    }, [saveBookmarks]);

    // Get bookmarks by book
    const getBookmarksByBook = useCallback((bookKey: string): Bookmark[] => {
        return bookmarks.filter(b => b.bookKey === bookKey);
    }, [bookmarks]);

    // Search bookmarks
    const searchBookmarks = useCallback((query: string): Bookmark[] => {
        if (!query.trim()) return bookmarks;

        const searchTerm = query.toLowerCase();
        return bookmarks.filter(bookmark =>
            bookmark.hadithText.toLowerCase().includes(searchTerm) ||
            bookmark.arabicText?.toLowerCase().includes(searchTerm) ||
            bookmark.bookName.toLowerCase().includes(searchTerm) ||
            bookmark.sectionName?.toLowerCase().includes(searchTerm) ||
            bookmark.notes?.toLowerCase().includes(searchTerm) ||
            bookmark.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
            bookmark.hadithNumber.toString().includes(query)
        );
    }, [bookmarks]);

    // Export bookmarks
    const exportBookmarks = useCallback((): string => {
        return JSON.stringify(bookmarks, null, 2);
    }, [bookmarks]);

    // Import bookmarks
    const importBookmarks = useCallback((data: string): boolean => {
        try {
            const imported = JSON.parse(data);
            if (!Array.isArray(imported)) {
                throw new Error('Invalid format');
            }

            // Validate imported bookmarks
            const validBookmarks = imported.filter(b =>
                b.id && b.hadithNumber && b.bookKey && b.bookName
            );

            // Merge with existing bookmarks, avoiding duplicates
            const existingIds = new Set(bookmarks.map(b => b.id));
            const newBookmarks = validBookmarks.filter((b: Bookmark) => !existingIds.has(b.id));

            const mergedBookmarks = [...bookmarks, ...newBookmarks];
            saveBookmarks(mergedBookmarks);
            return true;
        } catch (error) {
            console.error('Failed to import bookmarks:', error);
            return false;
        }
    }, [bookmarks, saveBookmarks]);

    return {
        bookmarks,
        isLoading,
        addBookmark,
        removeBookmark,
        toggleBookmark,
        isBookmarked,
        getBookmark,
        updateBookmarkNotes,
        updateBookmarkTags,
        clearBookmarks,
        getBookmarksByBook,
        searchBookmarks,
        exportBookmarks,
        importBookmarks,
        bookmarksCount: bookmarks.length,
        maxBookmarks: MAX_BOOKMARKS
    };
}