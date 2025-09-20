'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { LanguageSelector } from '@/components/layout/LanguageSelector';
import { useHadithData } from '@/lib/hooks/useHadith';
import { useSettings } from '@/lib/hooks/useSettings';

export default function BookPage() {
    const params = useParams();
    const router = useRouter();
    const { language } = useSettings();
    const book = params.book as string;

    const { data: bookData, isLoading, error } = useHadithData(book, language);

    if (isLoading) return <Loading />;

    if (error || !bookData) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Book Not Found</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        The requested book could not be loaded.
                    </p>
                    <Button onClick={() => router.push('/')}>
                        Return Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
            </div>

            {/* Book Info */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    {bookData.metadata.name}
                </h1>
                <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 mb-6">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        <span>{Object.keys(bookData.metadata.sections).length} Sections</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>{bookData.hadiths.length} Total Ahadith</span>
                    </div>
                </div>

                {/* Language Selector - Only shows for this book */}
                <div className="mb-8">
                    <LanguageSelector bookKey={book} />
                </div>
            </div>

            {/* Sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(bookData.metadata.sections).map(([sectionId, sectionName]) => {
                    const sectionDetail = bookData.metadata.section_details[sectionId];

                    if (!sectionDetail || sectionId === '0') return null;

                    const hadithCount = sectionDetail.hadithnumber_last - sectionDetail.hadithnumber_first + 1;

                    return (
                        <Card
                            key={sectionId}
                            className="cursor-pointer group hover:scale-105 transition-all duration-300"
                            onClick={() => router.push(`/books/${book}/${sectionId}`)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold">
                                    {sectionId}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {hadithCount} hadith{hadithCount !== 1 ? 's' : ''}
                                </div>
                            </div>

                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {sectionName}
                            </h3>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Hadith {sectionDetail.hadithnumber_first} - {sectionDetail.hadithnumber_last}
                            </p>

                            <div className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full w-0 group-hover:w-full transition-all duration-500 bg-primary-500 rounded-full" />
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}