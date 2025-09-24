import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const book = searchParams.get('book');
        const section = searchParams.get('section');
        const language = searchParams.get('language') || 'eng';

        if (!book) {
            return NextResponse.json(
                { error: 'Book parameter is required' },
                { status: 400 }
            );
        }

        // Construct the external API URL
        const baseUrl = 'https://cdn.jsdelivr.net/gh/adhilansari/hadithDb';
        let apiUrl: string;

        if (language === 'ara') {
            apiUrl = `${baseUrl}@main/data/ara-${book}.min.json`;
        } else {
            apiUrl = `${baseUrl}@main/translations/${language}-${book}.min.json`;
        }

        const response = await fetch(apiUrl, {
            cache: 'force-cache',
            next: { revalidate: 86400 },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json(
                    { error: `Book "${book}" not found in ${language} language` },
                    { status: 404 }
                );
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // If section is requested, filter the hadiths
        if (section) {
            const sectionDetails = data.metadata.section_details[section];
            if (!sectionDetails) {
                return NextResponse.json(
                    { error: `Section ${section} not found` },
                    { status: 404 }
                );
            }

            const { hadithnumber_first, hadithnumber_last } = sectionDetails;

            interface Hadith {
                hadithnumber: number;
                // other properties here
            }

            const filteredHadiths = data.hadiths.filter(
                (h: Hadith) => h.hadithnumber >= hadithnumber_first &&
                    h.hadithnumber <= hadithnumber_last
            );

            return NextResponse.json({
                ...data,
                hadiths: filteredHadiths,
            }, {
                headers: {
                    'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
                },
            });
        }

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
            },
        });
    } catch (error) {
        console.error('Error fetching hadith data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch hadith data' },
            { status: 500 }
        );
    }
}