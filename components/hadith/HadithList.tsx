// components/hadith/HadithList.tsx
'use client';

import { ICombinedHadith } from '@/lib/types/hadith';
import { HadithCard } from './HadithCard';
import { LoadingCard } from '@/components/ui/Loading';

interface HadithListProps {
    hadiths: ICombinedHadith[];
    bookName: string;
    loading?: boolean;
}

export function HadithList({ hadiths, bookName, loading }: HadithListProps) {
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
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <span className="text-2xl text-gray-400">📖</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Hadiths Found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                    No hadiths available in this section.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {hadiths.map((hadith, index) => (
                <div key={hadith.arabic.hadithnumber} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <HadithCard hadith={hadith} bookName={bookName} />
                </div>
            ))}
        </div>
    );
}