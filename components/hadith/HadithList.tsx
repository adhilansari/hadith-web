'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { HadithCard } from './HadithCard';
import { LoadingCard } from '@/components/ui/Loading';
import { useSearch } from '@/components/search/SearchProvider';
import type { ICombinedHadith } from '@/lib/types/hadith';

interface HadithListProps {
    hadiths: ICombinedHadith[];
    bookName: string;
    bookKey: string; // Add bookKey prop
    loading?: boolean;
    sectionId?: string;
    sectionName?: string;
}

export function HadithList({
    hadiths,
    bookName,
    bookKey,
    loading,
    sectionId,
    sectionName
}: HadithListProps) {
    const { searchQuery } = useSearch();
    const searchParams = useSearchParams();
    const [highlightedHadith, setHighlightedHadith] = useState<string | null>(null);
    const [searchHighlighted, setSearchHighlighted] = useState<Set<string>>(new Set());

    // Handle URL-based hadith highlighting (for shared links)
    useEffect(() => {
        const hadithParam = searchParams.get('hadith');
        const hashHadith = window.location.hash.replace('#hadith-', '');

        const targetHadith = hadithParam || hashHadith;

        if (targetHadith) {
            // Scroll to the hadith after a short delay to ensure it's rendered
            setTimeout(() => {
                const element = document.getElementById(`hadith-${targetHadith}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setHighlightedHadith(targetHadith);

                    // Remove highlight after 3 seconds
                    setTimeout(() => setHighlightedHadith(null), 3000);
                }
            }, 500);
        }
    }, [searchParams]);

    // Handle search-based highlighting
    useEffect(() => {
        if (searchQuery && searchQuery.trim()) {
            const newHighlighted = new Set<string>();
            const queryLower = searchQuery.toLowerCase();

            hadiths.forEach((hadith) => {
                const arabicMatch = hadith.arabic.text.toLowerCase().includes(queryLower);
                const translationMatch = hadith.translation.text.toLowerCase().includes(queryLower);
                const numberMatch = hadith.arabic.hadithnumber.toString().includes(searchQuery);

                if (arabicMatch || translationMatch || numberMatch) {
                    newHighlighted.add(hadith.arabic.hadithnumber.toString());
                }
            });

            console.log('Search highlighted hadiths:', Array.from(newHighlighted));

            setSearchHighlighted(newHighlighted);

            // Clear search highlights after 5 seconds
            setTimeout(() => setSearchHighlighted(new Set()), 5000);
        } else {
            setSearchHighlighted(new Set());
        }
    }, [searchQuery, hadiths]);

    if (loading) {
        return (
            <div className="space-y-6">
                {Array.from({ length: 5 }).map((_, i) => (
                    <LoadingCard key={i} />
                ))}
            </div>
        );
    }

    if (!hadiths.length) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-2xl text-muted-foreground">📖</span>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                    No Hadiths Found
                </h3>
                <p className="text-muted-foreground">
                    {searchQuery ? `No hadiths match "${searchQuery}"` : 'No hadiths available in this section.'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {hadiths.map((hadith, index) => {
                const hadithNumber = hadith.arabic.hadithnumber.toString();
                const isUrlHighlighted = highlightedHadith === hadithNumber;
                const isSearchHighlighted = searchHighlighted.has(hadithNumber);

                return (
                    <div
                        key={hadith.arabic.hadithnumber}
                        id={`hadith-${hadith.arabic.hadithnumber}`}
                        className={`animate-slide-up scroll-mt-20 transition-all duration-500 rounded-lg ${isUrlHighlighted
                            ? 'ring-4 ring-primary/60 shadow-2xl bg-primary/5 scale-[1.02]'
                            : isSearchHighlighted
                                ? 'ring-2 ring-yellow-400/60 shadow-lg bg-yellow-50/50 dark:bg-yellow-900/10'
                                : ''
                            }`}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <HadithCard
                            hadith={hadith}
                            bookName={bookName}
                            bookKey={bookKey}
                            sectionId={sectionId}
                            sectionName={sectionName}
                            searchQuery={searchQuery}
                        />
                    </div>
                );
            })}
        </div>
    );
}