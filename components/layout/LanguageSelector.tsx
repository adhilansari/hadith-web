'use client';

import { useRouter, useParams } from 'next/navigation';
import { Languages, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useSettings } from '@/lib/hooks/useSettings';
import { useEditions } from '@/lib/hooks/useHadith';
import type { ILanguageOption } from '@/lib/types/hadith';
import { extractLanguageCode, LANGUAGE_NAMES } from '@/lib/utils/languageExtractor';

interface LanguageSelectorProps {
    bookKey?: string;
    onLanguageChange?: (language: string) => void;
    compact?: boolean;
}

export function LanguageSelector({
    bookKey,
    onLanguageChange,
    compact = false
}: LanguageSelectorProps) {
    const { language, setLanguage } = useSettings();
    const { data: editions } = useEditions();
    const router = useRouter();
    const params = useParams();

    // Get current book from params if not provided
    const currentBook = bookKey || (params?.book as string);

    // Get available languages for the current book
    const getBookLanguages = (): ILanguageOption[] => {
        if (!editions || !currentBook) return [];

        const edition = editions[currentBook as keyof typeof editions];
        if (!edition) return [];

        // Extract unique language codes from collection names
        const languageCodes = new Set<string>();
        edition.collection.forEach(collection => {
            const langCode = extractLanguageCode(collection.name);
            if (langCode !== 'unknown') {
                languageCodes.add(langCode);
            }
        });

        // Convert to language options with proper names
        return Array.from(languageCodes)
            .map(code => {
                const languageInfo = LANGUAGE_NAMES[code];
                return {
                    code,
                    name: languageInfo?.name || code.toUpperCase(),
                    nativeName: languageInfo?.nativeName || code.toUpperCase(),
                };
            })
            .sort((a, b) => {
                // Priority order: Arabic first, then English, then others alphabetically
                if (a.code === 'ara') return -1;
                if (b.code === 'ara') return 1;
                if (a.code === 'eng') return -1;
                if (b.code === 'eng') return 1;
                return a.name.localeCompare(b.name);
            });
    };

    const availableLanguages = getBookLanguages();

    // Don't show language selector if no book is selected or no languages available
    if (!currentBook || availableLanguages.length === 0) {
        return null;
    }

    const handleLanguageChange = (newLanguage: string) => {
        setLanguage(newLanguage);
        onLanguageChange?.(newLanguage);

        // If we're on a book or section page, refresh to show new language
        if (params?.book) {
            router.refresh();
        }
    };

    if (compact) {
        return (
            <div className="flex items-center gap-2 flex-wrap">
                <Languages className="w-4 h-4 text-primary-500" />
                <div className="flex gap-1 flex-wrap">
                    {availableLanguages.map(({ code }) => (
                        <Button
                            key={code}
                            variant={language === code ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => handleLanguageChange(code)}
                            className="text-xs px-2 py-1 h-auto"
                        >
                            {code.toUpperCase()}
                        </Button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <Card>
            <div className="flex items-center gap-2 mb-4">
                <Languages className="w-4 h-4 text-primary-500" />
                <h3 className="font-medium">Available Translations</h3>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableLanguages.map(({ code, name, nativeName }) => (
                    <Button
                        key={code}
                        variant={language === code ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => handleLanguageChange(code)}
                        className="w-full justify-between text-left"
                    >
                        <div className="flex flex-col items-start">
                            <span className="text-sm font-medium">{name}</span>
                            {name !== nativeName && (
                                <span className="text-xs opacity-75">{nativeName}</span>
                            )}
                        </div>
                        {language === code && (
                            <Check className="w-4 h-4" />
                        )}
                    </Button>
                ))}
            </div>

            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                {availableLanguages.length} translation{availableLanguages.length !== 1 ? 's' : ''} available for this book
            </div>
        </Card>
    );
}