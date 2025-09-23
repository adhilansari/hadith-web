'use client';

import { HadithCard } from './HadithCard';
import { LoadingCard } from '@/components/ui/Loading';
import { useSearch } from '@/components/search/SearchProvider';
import type { ICombinedHadith } from '@/lib/types/hadith';

interface HadithListProps {
    hadiths: ICombinedHadith[];
    bookName: string;
    loading?: boolean;
}

export function HadithList({ hadiths, bookName, loading }: HadithListProps) {
    const { searchQuery } = useSearch();

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
            {hadiths.map((hadith, index) => (
                <div
                    key={hadith.arabic.hadithnumber}
                    id={`hadith-${hadith.arabic.hadithnumber}`}
                    className="animate-slide-up scroll-mt-20"
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    <HadithCard
                        hadith={hadith}
                        bookName={bookName}
                        bookKey={bookName}
                        searchQuery={searchQuery}
                    />
                </div>
            ))}
        </div>
    );
}