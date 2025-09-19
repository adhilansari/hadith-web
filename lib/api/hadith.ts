import { CacheManager } from './cache';
import type {
    IEditionsRes,
    IHadithRes,
    ICombinedHadith
} from '@/lib/types/hadith';

export class HadithAPI {
    static async getEditions(): Promise<IEditionsRes> {
        const cacheKey = 'editions';
        const cached = await CacheManager.get<IEditionsRes>(cacheKey);

        if (cached) return cached;

        try {
            const response = await fetch('/api/editions', {
                next: { revalidate: 86400 },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            await CacheManager.set(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Failed to fetch editions:', error);
            throw new Error('Failed to fetch hadith collections');
        }
    }

    static async getHadithData(
        book: string,
        language: string = 'eng'
    ): Promise<IHadithRes> {
        const cacheKey = `hadith_${book}_${language}`;
        const cached = await CacheManager.get<IHadithRes>(cacheKey);

        if (cached) return cached;

        try {
            const response = await fetch(`/api/hadith?book=${book}&language=${language}`, {
                next: { revalidate: 86400 },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Book "${book}" not found in ${language} language`);
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            await CacheManager.set(cacheKey, data);
            return data;
        } catch (error) {
            console.error(`Failed to fetch ${book} in ${language}:`, error);
            throw error;
        }
    }

    static async getCombinedHadith(
        book: string,
        section: string,
        language: string = 'eng'
    ): Promise<ICombinedHadith[]> {
        try {
            // Fetch both Arabic and translation data
            const [arabicResponse, translationResponse] = await Promise.all([
                fetch(`/api/hadith?book=${book}&section=${section}&language=ara`),
                language === 'ara'
                    ? fetch(`/api/hadith?book=${book}&section=${section}&language=ara`)
                    : fetch(`/api/hadith?book=${book}&section=${section}&language=${language}`)
            ]);

            if (!arabicResponse.ok || !translationResponse.ok) {
                throw new Error('Failed to fetch hadith data');
            }

            const [arabicData, translationData] = await Promise.all([
                arabicResponse.json(),
                translationResponse.json()
            ]);

            // Combine the hadiths
            const combinedHadiths = arabicData.hadiths.map((arabic: any) => {
                const translation = translationData.hadiths.find(
                    (t: any) => t.hadithnumber === arabic.hadithnumber
                );

                return {
                    arabic,
                    translation: translation || arabic,
                };
            });

            return combinedHadiths;
        } catch (error) {
            console.error(`Failed to get combined hadith for ${book}/${section}:`, error);
            throw error;
        }
    }

    // Keep other methods the same...
    static async searchHadiths(
        query: string,
        book?: string,
        language: string = 'eng'
    ): Promise<ICombinedHadith[]> {
        try {
            if (!query.trim()) return [];

            const searchTerm = query.toLowerCase().trim();

            if (book) {
                const data = await this.getHadithData(book, language);
                const arabicData = await this.getHadithData(book, 'ara');

                const matchingHadiths = data.hadiths.filter(hadith =>
                    hadith.text.toLowerCase().includes(searchTerm)
                );

                return matchingHadiths.map(translation => {
                    const arabic = arabicData.hadiths.find(
                        a => a.hadithnumber === translation.hadithnumber
                    );

                    return {
                        arabic: arabic || translation,
                        translation,
                    };
                });
            } else {
                const editions = await this.getEditions();
                const bookKeys = Object.keys(editions);
                const results: ICombinedHadith[] = [];

                for (const bookKey of bookKeys.slice(0, 3)) {
                    try {
                        const bookResults = await this.searchHadiths(query, bookKey, language);
                        results.push(...bookResults.slice(0, 10));
                    } catch (error) {
                        console.warn(`Failed to search in ${bookKey}:`, error);
                    }
                }

                return results;
            }
        } catch (error) {
            console.error('Search failed:', error);
            throw error;
        }
    }

    static async getBookStats(book: string): Promise<{
        totalHadiths: number;
        totalSections: number;
        availableLanguages: string[];
    }> {
        try {
            const arabicData = await this.getHadithData(book, 'ara');
            const editions = await this.getEditions();

            const bookEdition = editions[book as keyof IEditionsRes];
            const availableLanguages = bookEdition?.collection.map(c => c.language) || [];

            return {
                totalHadiths: arabicData.hadiths.length,
                totalSections: Object.keys(arabicData.metadata.sections).length - 1,
                availableLanguages,
            };
        } catch (error) {
            console.error(`Failed to get stats for ${book}:`, error);
            return {
                totalHadiths: 0,
                totalSections: 0,
                availableLanguages: [],
            };
        }
    }
}