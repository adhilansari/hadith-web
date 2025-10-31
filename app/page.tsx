'use client';

import { BookCard } from '@/components/hadith/BookCard';
import { Loading } from '@/components/ui/Loading';
import { useEditions } from '@/lib/hooks/useHadith';
import { useSettings } from '@/lib/hooks/useSettings';
import { useEffect } from 'react';

export default function HomePage() {
  const { data: editions, error, isLoading } = useEditions();
  const { setLanguage } = useSettings();

  // ✅ Reset language on home load
  useEffect(() => {
    setLanguage('eng');
    console.log('Language set to English (eng)');
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedLanguage', 'eng');
      console.log('Language reset to English (eng)');
    }
  }, [setLanguage]);

  if (isLoading) return <Loading />;

  if (error) {
    return (
      <div className="container mx-auto max-w-[75rem]  px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Error Loading Collections</h2>
          <p className="text-muted-foreground">
            Unable to load Hadith collections. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-[75rem] px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary mb-4">
          Authentic Hadith Collections
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Access authentic Islamic traditions with verified translations in multiple languages.
          Study the sayings and actions of Prophet Muhammad (ﷺ) from renowned collections.
        </p>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {editions && Object.entries(editions).map(([key, edition]) => (
          <BookCard key={key} bookKey={key} edition={edition} />
        ))}
      </div>

      {/* Features Section */}
      {/* <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center p-6 rounded-xl bg-primary/5 border border-primary/10">
          <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-xl">📖</span>
          </div>
          <h3 className="font-semibold text-lg mb-2 text-foreground">Authentic Sources</h3>
          <p className="text-muted-foreground text-sm">
            All hadith from verified authentic collections with scholarly grading
          </p>
        </div>

        <div className="text-center p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
          <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-xl">🌐</span>
          </div>
          <h3 className="font-semibold text-lg mb-2 text-foreground">Multiple Languages</h3>
          <p className="text-muted-foreground text-sm">
            Read translations in English, Arabic, Urdu, Turkish, and more
          </p>
        </div>

        <div className="text-center p-6 rounded-xl bg-purple-500/5 border border-purple-500/10">
          <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-xl">📱</span>
          </div>
          <h3 className="font-semibold text-lg mb-2 text-foreground">Modern Interface</h3>
          <p className="text-muted-foreground text-sm">
            Beautiful, responsive design that works offline as a PWA
          </p>
        </div>
      </div> */}
    </div>
  );
}