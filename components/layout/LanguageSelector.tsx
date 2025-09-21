'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Languages, Check, ChevronDown, ChevronUp } from 'lucide-react';
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
    const [isExpanded, setIsExpanded] = useState(false);
    const { language, setLanguage } = useSettings();
    const { data: editions } = useEditions();
    const router = useRouter();
    const params = useParams();

    // Get current book from params if not provided
    const currentBook = bookKey || (params?.book as string);

    // Get available languages for the current book
    const getBookLanguages = (): ILanguageOption[] => {
        // HARDCODED: Return only English for now
        return [{
            code: 'eng',
            name: 'English',
            nativeName: 'English'
        }];

        /*
        // ORIGINAL DYNAMIC LANGUAGE DETECTION (commented out)
        if (!editions || !currentBook) return [];
    
        const edition = editions[currentBook as keyof typeof editions];
        if (!edition) return [];
    
        // Extract unique language codes from collection names
        const languageCodes = new Set<string>();
        edition.collection.forEach(collection => {
            const langCode = extractLanguageCode(collection.name);
            if (langCode !== 'unknown' && langCode !== 'ara') { // Filter out Arabic
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
                // Priority order: English first, then others alphabetically
                if (a.code === 'eng') return -1;
                if (b.code === 'eng') return 1;
                return a.name.localeCompare(b.name);
            });
        */
    };

    const availableLanguages = getBookLanguages();
    const currentLanguageInfo = availableLanguages.find(lang => lang.code === language);

    // Don't show language selector if no book is selected or no languages available
    if (!currentBook || availableLanguages.length === 0) {
        return null;
    }

    const handleLanguageChange = (newLanguage: string) => {
        setLanguage(newLanguage);
        onLanguageChange?.(newLanguage);
        setIsExpanded(false); // Collapse after selection

        // If we're on a book or section page, refresh to show new language
        if (params?.book) {
            router.refresh();
        }
    };

    if (compact) {
        return (
            <div className="flex items-center gap-2 flex-wrap">
                <Languages className="w-4 h-4 text-primary" />
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
            {/* Accordion Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-0 bg-transparent border-none cursor-pointer group"
            >
                <div className="flex items-center gap-2">
                    <Languages className="w-4 h-4 text-primary" />
                    <h3 className="font-medium">Available Translations</h3>
                </div>

                <div className="flex items-center gap-2">
                    {/* Show current selection */}
                    {currentLanguageInfo && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-medium">{currentLanguageInfo.name}</span>
                        </div>
                    )}

                    {/* Chevron indicator */}
                    {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground transition-transform duration-200" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200" />
                    )}
                </div>
            </button>

            {/* Accordion Content */}
            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-80 opacity-100 mt-4' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="space-y-2 max-h-60 overflow-y-auto w-auto">
                    {availableLanguages.map(({ code, name, nativeName }) => (
                        <Button
                            key={code}
                            variant={language === code ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => handleLanguageChange(code)}
                            className="w-full justify-between text-left transition-all hover:scale-[1.02]"
                        >
                            <div className="flex flex-col items-start">
                                <span className="text-sm font-medium">{name}</span>
                                {name !== nativeName && (
                                    <span className="text-xs opacity-75">{nativeName}</span>
                                )}
                            </div>
                            {language === code && (
                                <Check className="w-4 h-4 text-primary" />
                            )}
                        </Button>
                    ))}
                </div>

                <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                    {availableLanguages.length} translation{availableLanguages.length !== 1 ? 's' : ''} available for this book
                </div>
            </div>
        </Card>
    );
}