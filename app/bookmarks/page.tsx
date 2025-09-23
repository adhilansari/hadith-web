// app/bookmarks/page.tsx
import { BookmarksPage } from '@/components/bookmarks/BookmarksPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Bookmarks - Hadith.net',
    description: 'Your saved hadith collection for quick reference and study.',
};

export default function Bookmarks() {
    return <BookmarksPage />;
}