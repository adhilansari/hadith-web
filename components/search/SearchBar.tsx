'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Book, List, FileText, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useSearch } from './SearchProvider';
import { cn } from '@/lib/utils/helpers';

interface SearchBarProps {
    placeholder?: string;
    compact?: boolean;
}

export function SearchBar({ placeholder, compact = false }: SearchBarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const {
        isSearching,
        searchResults,
        searchType,
        performSearch,
        clearSearch,
    } = useSearch();

    // Get context-aware placeholder
    const getPlaceholder = (): string => {
        if (placeholder) return placeholder;

        switch (searchType) {
            case 'book':
                return 'Search hadith collections...';
            case 'section':
                return 'Search sections in this book...';
            case 'hadith':
                return 'Search hadiths...';
            default:
                return 'Search...';
        }
    };

    // Get appropriate icon for result type
    const getResultIcon = (type: string) => {
        switch (type) {
            case 'book':
                return <Book className="w-4 h-4" />;
            case 'section':
                return <List className="w-4 h-4" />;
            case 'hadith':
                return <FileText className="w-4 h-4" />;
            default:
                return <Search className="w-4 h-4" />;
        }
    };

    // Handle search input
    const handleSearch = async (query: string) => {
        setInputValue(query);
        await performSearch(query);
        setIsOpen(query.length > 0 && searchResults.length > 0);
    };

    // Define a type for the search result
    interface SearchResult {
        type: string;
        id: string;
        title: string;
        subtitle?: string;
        description?: string;
        url?: string;
    }

    // Handle result selection
    const handleResultSelect = (result: SearchResult) => {
        if (result.url) {
            if (result.url.startsWith('#')) {
                // Scroll to element on same page
                const element = document.getElementById(result.url.substring(1));
                element?.scrollIntoView({ behavior: 'smooth' });
            } else {
                // Navigate to different page
                router.push(result.url);
            }
        }
        setIsOpen(false);
        setInputValue('');
        clearSearch();
    };

    // Handle clear search
    const handleClear = () => {
        setInputValue('');
        clearSearch();
        setIsOpen(false);
        inputRef.current?.focus();
    };

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.search-container')) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            inputRef.current?.blur();
        }
    };

    return (
        <div className={cn('search-container md:relative', compact ? 'w-full' : 'w-full max-w-md')}>
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />

                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => handleSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsOpen(inputValue.length > 0 && searchResults.length > 0)}
                    placeholder={getPlaceholder()}
                    className={cn(
                        'w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600',
                        'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
                        'placeholder-gray-500 dark:placeholder-gray-400',
                        'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                        'transition-all duration-200',
                        compact ? 'text-sm' : 'text-base'
                    )}
                />

                {inputValue && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
                    >
                        <X className="w-3 h-3" />
                    </Button>
                )}
            </div>

            {/* Search Results Dropdown */}
            {isOpen && (
                <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto py-2 shadow-xl border border-gray-300 dark:border-gray-600">
                    <div className="p-2">
                        {/* Search Type Indicator */}
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 px-2">
                            Searching {searchType === 'book' ? 'collections' : searchType === 'section' ? 'sections' : 'hadiths'}
                        </div>

                        {isSearching ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div className="space-y-1">
                                {searchResults.map((result, index) => (
                                    <button
                                        key={`${result.type}-${result.id}-${index}`}
                                        onClick={() => handleResultSelect(result)}
                                        className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 text-primary-500">
                                                {getResultIcon(result.type)}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                                        {result.title}
                                                    </h3>
                                                    <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-primary-500 transition-colors" />
                                                </div>

                                                {result.subtitle && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 truncate">
                                                        {result.subtitle}
                                                    </p>
                                                )}

                                                {result.description && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        {result.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : inputValue ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>No results found for &quot;{inputValue}&quot;</p>
                                <p className="text-xs mt-1">
                                    Try searching for {searchType === 'book' ? 'collection names' : searchType === 'section' ? 'section titles' : 'hadith text'}
                                </p>
                            </div>
                        ) : null}
                    </div>
                </Card>
            )}
        </div>
    );
}