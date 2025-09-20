// lib/hooks/useHadith.ts - Enhanced version with better error handling
'use client';

import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { HadithAPI } from '@/lib/api/hadith';
import type {
    IEditionsRes,
    IHadithRes,
    ICombinedHadith
} from '@/lib/types/hadith';

// SWR configuration for hadith data
const swrConfig = {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    dedupingInterval: 3600000, // 1 hour
    errorRetryCount: 3,
    errorRetryInterval: 1000,
    onError: (error: Error) => {
        console.error('SWR Error:', error);
    },
};

// Enhanced fetcher functions with better error handling
const editionsFetcher = async () => {
    try {
        console.log('Fetching editions...');
        return await HadithAPI.getEditions();
    } catch (error) {
        console.error('Error fetching editions:', error);
        throw error;
    }
};

const hadithDataFetcher = async ([, book, language]: [string, string, string]) => {
    try {
        console.log('Fetching hadith data for:', { book, language });
        const result = await HadithAPI.getHadithData(book, language);
        console.log('Successfully fetched hadith data for:', book);
        return result;
    } catch (error) {
        console.error('Error fetching hadith data:', { book, language, error });
        // Don't throw - let SWR handle it gracefully
        throw new Error(`Failed to load book "${book}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

const combinedHadithFetcher = async ([, book, section, language]: [string, string, string, string]) => {
    try {
        console.log('Fetching combined hadith for:', { book, section, language });
        return await HadithAPI.getCombinedHadith(book, section, language);
    } catch (error) {
        console.error('Error fetching combined hadith:', { book, section, language, error });
        throw new Error(`Failed to load section "${section}" from book "${book}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

const bookStatsFetcher = async ([, book]: [string, string]) => {
    try {
        console.log('Fetching book stats for:', book);
        return await HadithAPI.getBookStats(book);
    } catch (error) {
        console.error('Error fetching book stats:', { book, error });
        throw error;
    }
};

// Hook for getting all hadith editions/collections
export function useEditions() {
    const { data, error, isLoading, mutate } = useSWR<IEditionsRes, Error>(
        'editions',
        editionsFetcher,
        {
            ...swrConfig,
            revalidateIfStale: true,
        }
    );

    return {
        data,
        error,
        isLoading,
        refetch: mutate,
        isError: !!error,
    };
}

// Enhanced hook for getting hadith data with better validation
export function useHadithData(book: string, language: string = 'eng') {
    // Validate book parameter
    const isValidBook = book && typeof book === 'string' && book.trim().length > 0;

    console.log('useHadithData called with:', { book, language, isValidBook });

    const { data, error, isLoading, mutate } = useSWR<IHadithRes, Error>(
        isValidBook ? ['hadith', book.toLowerCase().trim(), language] : null,
        hadithDataFetcher,
        {
            ...swrConfig,
            onSuccess: (data) => {
                console.log('Successfully loaded hadith data for:', book, data?.metadata?.name);
            },
            onError: (error) => {
                console.error('SWR onError for hadith data:', { book, language, error });
            }
        }
    );

    return {
        data,
        error,
        isLoading,
        refetch: mutate,
        isError: !!error,
        isValidBook,
    };
}

// Hook for getting combined Arabic and translation hadiths for a section
export function useCombinedHadith(
    book: string,
    section: string,
    language: string = 'eng'
) {
    const isValidParams = book && section &&
        typeof book === 'string' && typeof section === 'string' &&
        book.trim().length > 0 && section.trim().length > 0;

    const { data, error, isLoading, mutate } = useSWR<ICombinedHadith[], Error>(
        isValidParams ? ['combined', book.toLowerCase().trim(), section, language] : null,
        combinedHadithFetcher,
        swrConfig
    );

    return {
        data,
        error,
        isLoading,
        refetch: mutate,
        isError: !!error,
        isValidParams,
    };
}

// Hook for getting book statistics
export function useBookStats(book: string) {
    const isValidBook = book && typeof book === 'string' && book.trim().length > 0;

    const { data, error, isLoading, mutate } = useSWR(
        isValidBook ? ['stats', book.toLowerCase().trim()] : null,
        bookStatsFetcher,
        {
            ...swrConfig,
            revalidateIfStale: true,
        }
    );

    return {
        data,
        error,
        isLoading,
        refetch: mutate,
        isError: !!error,
    };
}

// Rest of your hooks remain the same...
export function useHadithSearch() {
    const { trigger, data, error, isMutating } = useSWRMutation<
        ICombinedHadith[],
        Error,
        string,
        { query: string; book?: string; language?: string }
    >(
        'search',
        async (_, { arg }) => {
            const { query, book, language = 'eng' } = arg;
            return HadithAPI.searchHadiths(query, book, language);
        },
        {
            revalidate: false,
        }
    );

    const search = (query: string, book?: string, language: string = 'eng') => {
        if (!query.trim()) return Promise.resolve([]);
        return trigger({ query, book, language });
    };

    return {
        search,
        data,
        error,
        isSearching: isMutating,
        isError: !!error,
    };
}

// Enhanced combined hook for book page data
export function useBookPage(book: string, language: string = 'eng') {
    const editionsQuery = useEditions();
    const hadithDataQuery = useHadithData(book, language);
    const statsQuery = useBookStats(book);

    const isLoading = editionsQuery.isLoading || hadithDataQuery.isLoading || statsQuery.isLoading;
    const error = editionsQuery.error || hadithDataQuery.error || statsQuery.error;

    // Check if book exists in editions
    const bookExists = editionsQuery.data && book &&
        Object.keys(editionsQuery.data).some(key =>
            key.toLowerCase() === book.toLowerCase()
        );

    return {
        editions: editionsQuery.data,
        bookData: hadithDataQuery.data,
        stats: statsQuery.data,
        isLoading,
        error,
        isError: !!error,
        bookExists,
        refetch: () => {
            editionsQuery.refetch();
            hadithDataQuery.refetch();
            statsQuery.refetch();
        },
    };
}

// Hook for managing favorites/bookmarks (keep your existing implementation)
export function useBookmarks() {
    const { data, mutate } = useSWR<ICombinedHadith[]>(
        'bookmarks',
        () => {
            if (typeof window === 'undefined') return [];
            try {
                const stored = localStorage.getItem('hadith-bookmarks');
                return stored ? JSON.parse(stored) : [];
            } catch {
                return [];
            }
        },
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    const addBookmark = (hadith: ICombinedHadith) => {
        const bookmarks = data || [];
        const isAlreadyBookmarked = bookmarks.some(
            b => b.arabic.hadithnumber === hadith.arabic.hadithnumber
        );

        if (isAlreadyBookmarked) return;

        const newBookmarks = [...bookmarks, hadith];
        localStorage.setItem('hadith-bookmarks', JSON.stringify(newBookmarks));
        mutate(newBookmarks);
    };

    const removeBookmark = (hadithNumber: number) => {
        const bookmarks = data || [];
        const newBookmarks = bookmarks.filter(
            b => b.arabic.hadithnumber !== hadithNumber
        );
        localStorage.setItem('hadith-bookmarks', JSON.stringify(newBookmarks));
        mutate(newBookmarks);
    };

    const isBookmarked = (hadithNumber: number) => {
        return data?.some(b => b.arabic.hadithnumber === hadithNumber) || false;
    };

    const clearBookmarks = () => {
        localStorage.removeItem('hadith-bookmarks');
        mutate([]);
    };

    return {
        bookmarks: data || [],
        addBookmark,
        removeBookmark,
        isBookmarked,
        clearBookmarks,
    };
}