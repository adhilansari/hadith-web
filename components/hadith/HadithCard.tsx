// components/hadith/HadithCard.tsx (COMPLETE REPLACEMENT)
'use client';

import { useState } from 'react';
import { Bookmark, Share2, Copy, Check, Edit } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useSettings } from '@/lib/hooks/useSettings';
import { useBookmarks } from '@/lib/hooks/useBookmarks';
import { useAdmin } from '@/lib/hooks/useAdmin';
import { HadithEditorModal } from '@/components/admin/HadithEditorModal';
import { cn } from '@/lib/utils/helpers';
import type { ICombinedHadith } from '@/lib/types/hadith';

interface HadithCardProps {
    hadith: ICombinedHadith;
    bookName: string;
    bookKey: string;
    sectionId?: string;
    sectionName?: string;
    searchQuery?: string;
    onTranslationUpdate?: () => void;
}

function highlightText(text: string, searchQuery?: string): React.ReactNode {
    if (!searchQuery || !text) return text;

    const searchTerms = searchQuery
        .trim()
        .split(/\s+/)
        .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .filter(term => term.length > 0);

    if (searchTerms.length === 0) return text;

    const regex = new RegExp(`(${searchTerms.join('|')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
        regex.test(part) ? (
            <mark
                key={index}
                className="bg-primary/20 text-primary-foreground px-1 rounded"
            >
                {part}
            </mark>
        ) : (
            part
        )
    );
}

export function HadithCard({
    hadith,
    bookName,
    bookKey,
    sectionId,
    sectionName,
    searchQuery,
    onTranslationUpdate,
}: HadithCardProps) {
    const [copied, setCopied] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [shareSuccess, setShareSuccess] = useState(false);
    const [editorOpen, setEditorOpen] = useState(false);
    const { fontSize, arabicFontSize, showGrades, showReferences, language } = useSettings();
    const { isBookmarked, toggleBookmark } = useBookmarks();
    const { isAuthenticated } = useAdmin();

    const hadithId = `${bookKey}-${hadith.arabic.hadithnumber}`;
    const bookmarked = isBookmarked(hadithId);

    const fontSizeClasses = {
        small: 'text-sm',
        medium: 'text-base',
        large: 'text-lg',
    };

    const arabicFontSizeClasses = {
        small: 'text-lg',
        medium: 'text-xl',
        large: 'text-2xl',
    };

    const generateHadithUrl = (): string => {
        const baseUrl = window.location.origin;
        const hadithNumber = hadith.arabic.hadithnumber;

        if (sectionId) {
            return `${baseUrl}/books/${bookKey}/${sectionId}#hadith-${hadithNumber}`;
        } else {
            return `${baseUrl}/books/${bookKey}?hadith=${hadithNumber}`;
        }
    };

    const handleCopy = async () => {
        const hadithUrl = generateHadithUrl();
        const text = `${hadith.arabic.text}

${hadith.translation.text}

— ${bookName}, Hadith ${hadith.arabic.hadithnumber}
${hadithUrl}`;

        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            try {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (fallbackError) {
                console.error('Fallback copy failed:', fallbackError);
            }
        }
    };

    const handleShare = async () => {
        const hadithUrl = generateHadithUrl();
        const text = `${hadith.arabic.text}

${hadith.translation.text}

— ${bookName}, Hadith ${hadith.arabic.hadithnumber}
${hadithUrl}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Hadith from ${bookName}`,
                    text: text,
                    url: hadithUrl,
                });
                setShareSuccess(true);
                setTimeout(() => setShareSuccess(false), 2000);
                return;
            } catch (err) {
                if (err instanceof Error && err.name !== 'AbortError') {
                    console.error('Error sharing:', err);
                }
            }
        }

        await handleCopy();
    };

    const handleBookmarkToggle = async () => {
        try {
            await toggleBookmark(hadith, bookKey, bookName, sectionId, sectionName);
        } catch (error) {
            console.error('Failed to toggle bookmark:', error);
        }
    };

    const handleSaveTranslation = async (hadithNumber: number, updatedText: string) => {
        try {
            const response = await fetch('/api/admin/update-translation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    book: bookKey,
                    language,
                    hadithNumber,
                    text: updatedText,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update translation');
            }

            if (onTranslationUpdate) {
                onTranslationUpdate();
            }
        } catch (error) {
            console.error('Save translation error:', error);
            throw error;
        }
    };

    const isSearchMatch = searchQuery && (
        hadith.arabic.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hadith.translation.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hadith.arabic.hadithnumber.toString().includes(searchQuery)
    );

    return (
        <>
            <Card className={cn(
                'relative group transition-all duration-200',
                isSearchMatch && 'ring-2 ring-primary/50 shadow-lg border-primary/20'
            )}>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                    {hadith.arabic.hadithnumber}
                </div>

                <div className="flex flex-col md:flex-row gap-5 items-start w-full">
                    <div
                        className={cn(
                            'arabic-text mb-6 leading-relaxed select-text md:w-1/2 text-right order-1 md:order-2 self-start',
                            arabicFontSizeClasses[arabicFontSize]
                        )}
                    >
                        {highlightText(hadith.arabic.text, searchQuery)}
                    </div>

                    <div
                        className={cn(
                            'text-foreground/80 leading-relaxed mb-6 select-text md:w-1/2 order-2 md:order-1 text-left self-start',
                            fontSizeClasses[fontSize]
                        )}
                    >
                        {highlightText(hadith.translation.text, searchQuery)}
                    </div>
                </div>

                {showGrades && hadith.translation.grades && hadith.translation.grades.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2 text-left">
                            Authenticity Grades:
                        </h4>
                        <div className="flex flex-wrap gap-2 justify-start">
                            {hadith.translation.grades.map((grade, index) => (
                                <span
                                    key={index}
                                    className={cn(
                                        'px-3 py-1 rounded-full text-xs font-medium border',
                                        grade.grade.toLowerCase().includes('sahih')
                                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                            : grade.grade.toLowerCase().includes('hasan')
                                                ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20'
                                                : grade.grade.toLowerCase().includes('daif') || grade.grade.toLowerCase().includes('weak')
                                                    ? 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                                                    : 'bg-muted text-muted-foreground border-border'
                                    )}
                                >
                                    {grade.name}: {grade.grade}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {showReferences && hadith.translation.reference && (
                    <div className="mb-4 text-sm text-muted-foreground text-left">
                        <strong>Reference:</strong> Book {hadith.translation.reference.book},
                        Hadith {hadith.translation.reference.hadith}
                    </div>
                )}

                <div className="text-xs text-muted-foreground mb-4 text-left">
                    {bookName} • Arabic #{hadith.arabic.arabicnumber}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                        {isAuthenticated && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditorOpen(true)}
                                className="text-blue-500 hover:text-blue-600 transition-colors duration-200"
                                aria-label="Edit translation"
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBookmarkToggle}
                            className={cn(
                                'transition-colors duration-200',
                                bookmarked
                                    ? 'text-primary hover:text-primary/80'
                                    : 'text-muted-foreground hover:text-primary'
                            )}
                            aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
                        >
                            <Bookmark className={cn('w-4 h-4', bookmarked && 'fill-current')} />
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopy}
                            className="text-muted-foreground hover:text-primary transition-colors duration-200"
                            aria-label="Copy hadith text with URL"
                        >
                            {copied ? (
                                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                                <Copy className="w-4 h-4" />
                            )}
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleShare}
                            className="text-muted-foreground hover:text-primary transition-colors duration-200"
                            aria-label="Share hadith"
                        >
                            <Share2 className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="text-xs text-muted-foreground">
                        Hadith {hadith.arabic.hadithnumber}
                    </div>
                </div>
            </Card>

            {isAuthenticated && (
                <HadithEditorModal
                    isOpen={editorOpen}
                    onClose={() => setEditorOpen(false)}
                    hadith={hadith}
                    bookKey={bookKey}
                    language={language}
                    onSave={handleSaveTranslation}
                />
            )}
        </>
    );
}