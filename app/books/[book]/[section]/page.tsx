'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Hash } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { HadithList } from '@/components/hadith/HadithList';
import { Loading } from '@/components/ui/Loading';
import { LanguageSelector } from '@/components/layout/LanguageSelector';
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
            <div className="container mx-auto max-w-[75rem] px-4 py-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-destructive mb-4">Section Not Found</h2>
                    <p className="text-muted-foreground mb-6">
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
    const bookName = bookData?.metadata.name || editions?.[book as keyof typeof editions]?.name || book;
    const sectionDetail = bookData?.metadata.section_details[section];

    return (
        <div className="container mx-auto max-w-[75rem] px-4 py-8">
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
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-bold text-lg">
                        {section}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                            {sectionName}
                        </h1>
                        <p className="text-muted-foreground">{bookName}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-4">
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
                </div>

                {/* Compact Language Selector */}
                <LanguageSelector bookKey={book} compact={true} />
            </div>

            {/* Hadiths List */}
            <HadithList
                hadiths={hadiths}
                bookName={bookName}
                bookKey={book}
                sectionId={section}
                sectionName={sectionName}
                loading={isLoading}
            />
        </div>
    );
}