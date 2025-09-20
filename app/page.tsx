'use client';

import { BookCard } from '@/components/hadith/BookCard';
import { Loading } from '@/components/ui/Loading';
import { useEditions } from '@/lib/hooks/useHadith';

export default function HomePage() {
  const { data: editions, error, isLoading } = useEditions();

  if (isLoading) return <Loading />;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Collections</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Unable to load Hadith collections. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r gradient-text-primary text-transparent mb-4">
          Authentic Hadith Collections
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Access authentic Islamic traditions with verified translations in multiple languages.
          Study the sayings and actions of Prophet Muhammad (ﷺ) from renowned collections.
        </p>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {editions && Object.entries(editions).map(([key, edition]) => (
          <BookCard key={key} bookKey={key} edition={edition} />
        ))}
      </div>

      {/* Features Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl">📖</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">Authentic Sources</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            All hadith from verified authentic collections with scholarly grading
          </p>
        </div>

        <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl">🌐</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">Multiple Languages</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Read translations in English, Arabic, Urdu, Turkish, and more
          </p>
        </div>

        <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl">📱</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">Modern Interface</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Beautiful, responsive design that works offline as a PWA
          </p>
        </div>
      </div>
    </div>
  );
}