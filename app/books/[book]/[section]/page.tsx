'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Hash } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { HadithList } from '@/components/hadith/HadithList';
import { Loading } from '@/components/ui/Loading';
import { useCombinedHadith, useHadithData, useEditions } from '@/lib/hooks/useHadith';
import { useSettings } from '@/lib/hooks/useSettings';

export default function SectionPage() {
    const params = useParams();
    const router = useRouter();
    const { language } = useSettings();
    const book = params.book as string;
    const section = params.section as string;

    const { data: editions } = useEditions();
    const { data: bookData } = useHadithData(book, language);
    const { data: hadiths, isLoading, error } = useCombinedHadith(book, section, language);

    if (isLoading) return <Loading />;

    if (error || !hadiths) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Section Not Found</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        The requested section could not be loaded.
                    </p>
                    <Button onClick={() => router.push(`/books/${book}`)}>
                        Back to Book
                    </Button>
                </div>
            </div>
        );
    }

    const sectionName = bookData?.metadata.sections[section] || `Section ${section}`;
    const bookName = bookData?.metadata.name || editions?.[book]?.name || book;
    const sectionDetail = bookData?.metadata.section_details[section];

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/books/${book}`)}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to {book}
                </Button>
            </div>

            {/* Section Info */}
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {section}
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                            {sectionName}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">{bookName}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span>{hadiths.length} Ahadith</span>
                    </div>
                    {sectionDetail && (
                        <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4" />
                            <span>
                                Hadith {sectionDetail.hadithnumber_first} - {sectionDetail.hadithnumber_last}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span>Arabic with {language.toUpperCase()} Translation</span>
                    </div>
                </div>
            </div>

            {/* Hadiths List */}
            <HadithList hadiths={hadiths} bookName={bookName} loading={isLoading} />
        </div>
    );
}