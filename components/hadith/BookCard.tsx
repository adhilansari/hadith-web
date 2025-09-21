// components/hadith/BookCard.tsx
'use client';

import Link from 'next/link';
import { Book, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { IEdition } from '@/lib/types/hadith.ts';

interface BookCardProps {
    bookKey: string;
    edition: IEdition;
}

const bookColors: Record<string, string> = {
    bukhari: 'bg-red-500',
    muslim: 'bg-pink-500',
    abudawud: 'bg-blue-500',
    tirmidhi: 'bg-cyan-500',
    nasai: 'bg-green-500',
    ibnmajah: 'bg-teal-500',
    malik: 'bg-yellow-500',
    nawawi: 'bg-lime-500',
    qudsi: 'bg-purple-500',
    dehlawi: 'bg-orange-500',
};

const bookStats: Record<string, number> = {
    bukhari: 7563,
    muslim: 3033,
    abudawud: 5274,
    tirmidhi: 3960,
    nasai: 5758,
    ibnmajah: 4341,
    malik: 1720,
    nawawi: 42,
    qudsi: 40,
    dehlawi: 417,
};

export function BookCard({ bookKey, edition }: BookCardProps) {
    const colorClass = bookColors[bookKey] || 'bg-gray-500';
    const hadithCount = bookStats[bookKey] || 0;

    // Extract Arabic name from first collection if available
    const arabicCollection = edition.collection.find(c => c.language === 'Arabic');
    const arabicName = arabicCollection?.comments || '';

    return (
        <Link href={`/books/${bookKey}`}>
            <Card className="group cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-xl">
                <div className="flex items-start gap-4">
                    {/* Book Icon */}
                    <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                        {edition.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                        {/* Book Title */}
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {edition.name}
                        </h3>

                        {/* Arabic Name */}
                        {arabicName && (
                            <p className="arabic-text text-gray-600 dark:text-gray-400 text-base mt-1">
                                {arabicName}
                            </p>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                                <Book className="w-4 h-4" />
                                <span>{hadithCount.toLocaleString()} Ahadith</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <BarChart3 className="w-4 h-4" />
                                <span>{edition.collection.length} Collections</span>
                            </div>
                        </div>

                        {/* Languages Available */}
                        {/* <div className="flex flex-wrap gap-1 mt-2">
                            {edition.collection.map((collection, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                >
                                    {collection.language}
                                </span>
                            )).slice(0, 3)}
                            {edition.collection.length > 3 && (
                                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                    +{edition.collection.length - 3}
                                </span>
                            )}
                        </div> */}
                    </div>
                </div>

                {/* Hover Effect Indicator */}
                <div className="mt-4 w-full h-1 hidden md:block bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full w-0 group-hover:w-full transition-all duration-500 ${colorClass} rounded-full`} />
                </div>
            </Card>
        </Link>
    );
}