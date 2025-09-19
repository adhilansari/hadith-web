// components/hadith/HadithCard.tsx
'use client';

import { useState } from 'react';
import { Bookmark, Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useSettings } from '@/lib/hooks/useSettings';
import { cn } from '@/lib/utils/helpers';
import type { ICombinedHadith } from '@/lib/types/hadith.ts';

interface HadithCardProps {
    hadith: ICombinedHadith;
    bookName: string;
}

export function HadithCard({ hadith, bookName }: HadithCardProps) {
    const [copied, setCopied] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const { fontSize, arabicFontSize, showGrades, showReferences } = useSettings();

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

    const handleCopy = async () => {
        const text = `${hadith.arabic.text}\n\n${hadith.translation.text}\n\n— ${bookName}, Hadith ${hadith.arabic.hadithnumber}`;

        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleShare = async () => {
        const text = `${hadith.translation.text}\n\n— ${bookName}, Hadith ${hadith.arabic.hadithnumber}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Hadith from ${bookName}`,
                    text: text,
                    url: window.location.href,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            handleCopy();
        }
    };

    return (
        <Card className="relative group">
            {/* Hadith Number Badge - Updated to use CSS custom properties */}
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                {hadith.arabic.hadithnumber}
            </div>

            {/* Arabic Text */}
            <div className={cn(
                'arabic-text mb-6 leading-relaxed',
                arabicFontSizeClasses[arabicFontSize]
            )}>
                {hadith.arabic.text}
            </div>

            {/* Translation Text */}
            <div className={cn(
                'text-foreground/80 leading-relaxed mb-6',
                fontSizeClasses[fontSize]
            )}>
                {hadith.translation.text}
            </div>

            {/* Grades - Only show if enabled in settings */}
            {showGrades && hadith.translation.grades && hadith.translation.grades.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Authenticity Grades:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {hadith.translation.grades.map((grade, index) => (
                            <span
                                key={index}
                                className={cn(
                                    'px-3 py-1 rounded-full text-xs font-medium border',
                                    grade.grade.toLowerCase().includes('sahih')
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                                        : grade.grade.toLowerCase().includes('hasan')
                                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800'
                                            : 'bg-muted text-muted-foreground border-border'
                                )}
                            >
                                {grade.name}: {grade.grade}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Reference - Only show if enabled in settings */}
            {showReferences && hadith.translation.reference && (
                <div className="mb-4 text-sm text-muted-foreground">
                    <strong>Reference:</strong> Book {hadith.translation.reference.book},
                    Hadith {hadith.translation.reference.hadith}
                </div>
            )}

            {/* Source */}
            <div className="text-xs text-muted-foreground mb-4">
                {bookName} • Arabic #{hadith.arabic.arabicnumber}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setBookmarked(!bookmarked)}
                        className={cn(
                            'transition-colors duration-200',
                            bookmarked
                                ? 'text-primary hover:text-primary/80'
                                : 'text-muted-foreground hover:text-primary'
                        )}
                    >
                        <Bookmark className={cn('w-4 h-4', bookmarked && 'fill-current')} />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                        {copied ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                            <Copy className="w-4 h-4" />
                        )}
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleShare}
                        className="text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                        <Share2 className="w-4 h-4" />
                    </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                    Hadith {hadith.arabic.hadithnumber}
                </div>
            </div>
        </Card>
    );
}