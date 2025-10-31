/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { useSettings } from '@/lib/hooks/useSettings';
import { HadithAPI } from '@/lib/api/hadith';
import { ICollection, ICombinedHadith, IEditionsRes, IHadith } from '@/lib/types/hadith';

interface SearchResult {
    type: 'book' | 'section' | 'hadith';
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    data?: ICombinedHadith | IHadith;
    url?: string;
}

interface SearchContextType {
    isSearching: boolean;
    searchQuery: string;
    searchResults: SearchResult[];
    searchType: 'book' | 'section' | 'hadith';
    setSearchQuery: (query: string) => void;
    performSearch: (query: string) => Promise<void>;
    clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const pathname = usePathname();
    const params = useParams();
    const { language } = useSettings();

    // Determine search type based on current page
    const getSearchType = (): 'book' | 'section' | 'hadith' => {
        if (pathname === '/') return 'book';
        if (pathname.includes('/books/') && params?.section) return 'hadith';
        if (pathname.includes('/books/')) return 'section';
        return 'book';
    };

    const searchType = getSearchType();

    // Search for books (home page)
    const searchBooks = async (query: string): Promise<SearchResult[]> => {
        try {
            const editions: IEditionsRes = await HadithAPI.getEditions();
            const results: SearchResult[] = [];

            Object.entries(editions).forEach(([key, edition]) => {
                const bookName = edition.name.toLowerCase();
                const queryLower = query.toLowerCase();

                if (bookName.includes(queryLower) || key.includes(queryLower)) {
                    results.push({
                        type: 'book',
                        id: key,
                        title: edition.name,
                        subtitle: `${edition.collection.length} collections`,
                        description: `Available in ${edition.collection.map((c: ICollection) => c.language).join(', ')}`,
                        url: `/books/${key}`,
                    });
                }
            });

            return results.slice(0, 10);
        } catch (error) {
            console.error('Book search failed:', error);
            return [];
        }
    };

    // Search for sections within a book
    const searchSections = async (query: string): Promise<SearchResult[]> => {
        try {
            const bookKey = params?.book as string;
            if (!bookKey) return [];

            const bookData = await HadithAPI.getHadithData(bookKey, language);
            const results: SearchResult[] = [];
            const queryLower = query.toLowerCase();

            Object.entries(bookData.metadata.sections).forEach(([sectionId, sectionName]) => {
                if (sectionId === '0') return;

                const sectionNameLower = sectionName.toLowerCase();

                if (sectionNameLower.includes(queryLower) || sectionId.includes(queryLower)) {
                    const sectionDetail = bookData.metadata.section_details[sectionId];
                    const hadithCount = sectionDetail
                        ? sectionDetail.hadithnumber_last - sectionDetail.hadithnumber_first + 1
                        : 0;

                    results.push({
                        type: 'section',
                        id: sectionId,
                        title: sectionName,
                        subtitle: `Section ${sectionId}`,
                        description: `${hadithCount} ahadith`,
                        url: `/books/${bookKey}/${sectionId}`,
                    });
                }
            });

            return results.slice(0, 10);
        } catch (error) {
            console.error('Section search failed:', error);
            return [];
        }
    };

    // Fixed hadith search function
    const searchHadiths = async (query: string): Promise<SearchResult[]> => {
        try {
            const bookKey = params?.book as string;
            const sectionId = params?.section as string;

            if (!bookKey) return [];

            const results: SearchResult[] = [];
            const queryLower = query.toLowerCase();

            if (sectionId) {
                // Search within current section using combined hadith data
                try {
                    const hadiths = await HadithAPI.getCombinedHadith(bookKey, sectionId, language);

                    hadiths.forEach((hadith) => {
                        // Search in translation text
                        const translationText = hadith.translation?.text?.toLowerCase() || '';
                        // Search in Arabic text
                        const arabicText = hadith.arabic?.text?.toLowerCase() || '';
                        // Search in hadith number
                        const hadithNumber = hadith.arabic?.hadithnumber?.toString() || '';

                        if (translationText.includes(queryLower) ||
                            arabicText.includes(queryLower) ||
                            hadithNumber.includes(query)) {

                            results.push({
                                type: 'hadith',
                                id: hadithNumber,
                                title: `Hadith ${hadithNumber}`,
                                subtitle: truncateText(hadith.translation?.text || 'No translation available', 100),
                                description: hadith.translation?.grades?.[0]?.grade || '',
                                data: hadith,
                                url: `#hadith-${hadithNumber}`,
                            });
                        }
                    });
                } catch (error) {
                    console.error('Combined hadith search failed:', error);
                    // Fallback: search in the book's hadith data
                    const bookData = await HadithAPI.getHadithData(bookKey, language);
                    const sectionHadiths = bookData.hadiths.filter(h =>
                        bookData.metadata.section_details[sectionId] &&
                        h.hadithnumber >= bookData.metadata.section_details[sectionId].hadithnumber_first &&
                        h.hadithnumber <= bookData.metadata.section_details[sectionId].hadithnumber_last
                    );

                    sectionHadiths.forEach((hadith) => {
                        const text = hadith.text?.toLowerCase() || '';
                        const hadithNumber = hadith.hadithnumber?.toString() || '';

                        if (text.includes(queryLower) || hadithNumber.includes(query)) {
                            results.push({
                                type: 'hadith',
                                id: hadithNumber,
                                title: `Hadith ${hadithNumber}`,
                                subtitle: truncateText(hadith.text || 'No text available', 100),
                                description: hadith.grades?.[0]?.grade || '',
                                data: hadith,
                                url: `#hadith-${hadithNumber}`,
                            });
                        }
                    });
                }
            } else {
                // Search across entire book
                const bookData = await HadithAPI.getHadithData(bookKey, language);

                bookData.hadiths.forEach((hadith) => {
                    const text = hadith.text?.toLowerCase() || '';
                    const hadithNumber = hadith.hadithnumber?.toString() || '';

                    if (text.includes(queryLower) || hadithNumber.includes(query)) {
                        // Find which section this hadith belongs to
                        let sectionName = 'Unknown Section';
                        for (const [secId, secDetail] of Object.entries(bookData.metadata.section_details)) {
                            if (hadith.hadithnumber >= secDetail.hadithnumber_first &&
                                hadith.hadithnumber <= secDetail.hadithnumber_last) {
                                sectionName = bookData.metadata.sections[secId] || `Section ${secId}`;
                                break;
                            }
                        }

                        results.push({
                            type: 'hadith',
                            id: hadithNumber,
                            title: `Hadith ${hadithNumber}`,
                            subtitle: truncateText(hadith.text || 'No text available', 100),
                            description: `${sectionName} • ${hadith.grades?.[0]?.grade || 'No grade'}`,
                            data: hadith,
                            url: `/books/${bookKey}?hadith=${hadithNumber}`,
                        });
                    }
                });
            }

            return results.slice(0, 20);
        } catch (error) {
            console.error('Hadith search failed:', error);
            return [];
        }
    };

    const performSearch = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            let results: SearchResult[] = [];

            switch (searchType) {
                case 'book':
                    results = await searchBooks(query);
                    break;
                case 'section':
                    results = await searchSections(query);
                    break;
                case 'hadith':
                    results = await searchHadiths(query);
                    break;
            }

            setSearchResults(results);
        } catch (error) {
            console.error('Search failed:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [searchType, params, language]);

    const clearSearch = useCallback(() => {
        setSearchQuery('');
        setSearchResults([]);
    }, []);

    return (
        <SearchContext.Provider
            value={{
                isSearching,
                searchQuery,
                searchResults,
                searchType,
                setSearchQuery,
                performSearch,
                clearSearch,
            }}
        >
            {children}
        </SearchContext.Provider>
    );
}

export function useSearch() {
    const context = useContext(SearchContext);
    if (context === undefined) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
}

// Helper function
function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}