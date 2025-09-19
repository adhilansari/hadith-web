import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch('https://cdn.jsdelivr.net/gh/adhilansari/hadithDb@v2/editions.min.json', {
            cache: 'force-cache',
            next: { revalidate: 86400 }, // 24 hours
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
            },
        });
    } catch (error) {
        console.error('Error fetching editions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch editions' },
            { status: 500 }
        );
    }
}