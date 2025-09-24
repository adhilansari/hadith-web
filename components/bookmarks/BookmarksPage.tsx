'use client';

import { useState, useMemo } from 'react';
import { Search, BookmarkX, Download, Upload, Trash2, Calendar, Book, List, FileText, Hash, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useBookmarks, Bookmark } from '@/lib/hooks/useBookmarks';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/helpers';

export function BookmarksPage() {
    const {
        bookmarks,
        isLoading,
        removeBookmark,
        updateBookmarkNotes,
        updateBookmarkTags,
        clearBookmarks,
        searchBookmarks,
        exportBookmarks,
        importBookmarks,
        bookmarksCount
    } = useBookmarks();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBook, setSelectedBook] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'dateAdded' | 'bookName' | 'hadithNumber'>('dateAdded');
    const [editingNotes, setEditingNotes] = useState<string | null>(null);
    const [editingTags, setEditingTags] = useState<string | null>(null);
    const [tempNotes, setTempNotes] = useState('');
    const [tempTags, setTempTags] = useState('');

    const router = useRouter();

    // Get unique books from bookmarks
    const bookOptions = useMemo(() => {
        const books = bookmarks.reduce((acc, bookmark) => {
            if (!acc.some(b => b.key === bookmark.bookKey)) {
                acc.push({ key: bookmark.bookKey, name: bookmark.bookName });
            }
            return acc;
        }, [] as { key: string; name: string }[]);
        return books.sort((a, b) => a.name.localeCompare(b.name));
    }, [bookmarks]);

    // Filter and sort bookmarks
    const filteredBookmarks = useMemo(() => {
        let filtered = searchQuery ? searchBookmarks(searchQuery) : bookmarks;

        if (selectedBook !== 'all') {
            filtered = filtered.filter(b => b.bookKey === selectedBook);
        }

        return filtered.sort((a, b) => {
            switch (sortBy) {
                case 'dateAdded':
                    return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
                case 'bookName':
                    return a.bookName.localeCompare(b.bookName);
                case 'hadithNumber':
                    return a.hadithNumber - b.hadithNumber;
                default:
                    return 0;
            }
        });
    }, [bookmarks, searchQuery, selectedBook, sortBy, searchBookmarks]);

    // Handle bookmark navigation
    const handleBookmarkClick = (bookmark: Bookmark) => {
        if (bookmark.sectionId) {
            router.push(`/books/${bookmark.bookKey}/${bookmark.sectionId}#hadith-${bookmark.hadithNumber}`);
        } else {
            router.push(`/books/${bookmark.bookKey}?hadith=${bookmark.hadithNumber}`);
        }
    };

    // Handle export
    const handleExport = () => {
        const data = exportBookmarks();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hadith-bookmarks-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Handle import
    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const content = e.target?.result as string;
                    if (importBookmarks(content)) {
                        alert('Bookmarks imported successfully!');
                    } else {
                        alert('Failed to import bookmarks. Please check the file format.');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    // Handle notes editing
    const handleEditNotes = (bookmark: Bookmark) => {
        setEditingNotes(bookmark.id);
        setTempNotes(bookmark.notes || '');
    };

    const handleSaveNotes = (bookmarkId: string) => {
        updateBookmarkNotes(bookmarkId, tempNotes);
        setEditingNotes(null);
        setTempNotes('');
    };

    const handleCancelNotes = () => {
        setEditingNotes(null);
        setTempNotes('');
    };

    // Handle tags editing
    const handleEditTags = (bookmark: Bookmark) => {
        setEditingTags(bookmark.id);
        setTempTags(bookmark.tags.join(', '));
    };

    const handleSaveTags = (bookmarkId: string) => {
        const tags = tempTags.split(',').map(tag => tag.trim()).filter(tag => tag);
        updateBookmarkTags(bookmarkId, tags);
        setEditingTags(null);
        setTempTags('');
    };

    const handleCancelTags = () => {
        setEditingTags(null);
        setTempTags('');
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8" >
                <div className="animate-pulse space-y-4" >
                    <div className="h-8 bg-muted rounded w-1/4" > </div>
                    <div className="h-12 bg-muted rounded" >
                        <div className="space-y-3" >
                            {
                                [1, 2, 3].map(i => (
                                    <div key={i} className="h-32 bg-muted rounded" > </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl" >
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                    Bookmarks {bookmarksCount > 0 && (`(${bookmarksCount})`)}
                </h1>
                <p className="text-muted-foreground">
                    Your saved hadith for quick reference
                </p>
            </div>

            {/* Controls */}
            < Card className="p-4 mb-6" >
                <div className="space-y-4" >
                    {/* Search */}
                    <div className="relative" >
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)
                            }
                            placeholder="Search bookmarks..."
                            className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    {/* Filters and Actions */}
                    <div className="flex flex-wrap gap-3" >
                        {/* Book Filter */}
                        < select
                            value={selectedBook}
                            onChange={(e) => setSelectedBook(e.target.value)}
                            className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                        >
                            <option value="all" > All Books </option>
                            {
                                bookOptions.map(book => (
                                    <option key={book.key} value={book.key} >
                                        {book.name}
                                    </option>
                                ))
                            }
                        </select>

                        {/* Sort By */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'dateAdded' | 'bookName' | 'hadithNumber')}
                            className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                        >
                            <option value="dateAdded" > Date Added </option>
                            < option value="bookName" > Book Name </option>
                            < option value="hadithNumber" > Hadith Number </option>
                        </select>

                        {/* Actions */}
                        <div className="ml-auto flex gap-2" >
                            {/* <Button variant="ghost" size="sm" onClick={handleExport} >
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                            < Button variant="ghost" size="sm" onClick={handleImport} >
                                <Upload className="w-4 h-4 mr-2" />
                                Import
                            </Button> */}
                            {
                                bookmarksCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            if (confirm('Are you sure you want to clear all bookmarks?')) {
                                                clearBookmarks();
                                            }
                                        }
                                        }
                                        className="text-destructive hover:text-destructive flex items-center justify-center"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Clear All
                                    </Button>
                                )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Bookmarks List */}
            {
                filteredBookmarks.length === 0 ? (
                    <Card className="p-8 text-center" >
                        <BookmarkX className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium text-foreground mb-2" >
                            {bookmarksCount === 0 ? 'No bookmarks yet' : 'No bookmarks found'
                            }
                        </h3>
                        < p className="text-muted-foreground" >
                            {bookmarksCount === 0
                                ? 'Start bookmarking your favorite hadiths while reading'
                                : 'Try adjusting your search or filters'}
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-4" >
                        {
                            filteredBookmarks.map((bookmark) => (
                                <Card key={bookmark.id} className="p-4" >
                                    <div className="space-y-3" >
                                        {/* Header */}
                                        <div className="flex items-start justify-between" >
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground" >
                                                <Book className="w-4 h-4" />
                                                <span>{bookmark.bookName} </span>
                                                {
                                                    bookmark.sectionName && (
                                                        <>
                                                            <span>•</span>
                                                            < List className="w-4 h-4" />
                                                            <span>{bookmark.sectionName} </span>
                                                        </>
                                                    )
                                                }
                                                <span>•</span>
                                                < Hash className="w-4 h-4" />
                                                <span>#{bookmark.hadithNumber} </span>
                                            </div>
                                            < Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeBookmark(bookmark.id)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <BookmarkX className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        {/* Hadith Text */}
                                        <div className="space-y-2" >
                                            {
                                                bookmark.arabicText && (
                                                    <div className="arabic-text text-right p-3 bg-muted/30 rounded-lg">
                                                        {bookmark.arabicText}
                                                    </div>
                                                )
                                            }
                                            < div
                                                className="cursor-pointer hover:bg-muted/30 p-3 rounded-lg transition-colors"
                                                onClick={() => handleBookmarkClick(bookmark)}
                                            >
                                                <p className="text-foreground leading-relaxed" >
                                                    {bookmark.hadithText}
                                                </p>
                                                {
                                                    bookmark.grade && (
                                                        <div className="mt-2" >
                                                            <span className={
                                                                cn(
                                                                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                                                                    bookmark.grade.toLowerCase().includes('sahih')
                                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                        : bookmark.grade.toLowerCase().includes('hasan')
                                                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                                                )
                                                            }>
                                                                {bookmark.grade}
                                                            </span>
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </div>

                                        {/* Notes Section */}
                                        <div className="pt-2 border-t border-border" >
                                            {editingNotes === bookmark.id ? (
                                                <div className="space-y-2" >
                                                    <textarea
                                                        value={tempNotes}
                                                        onChange={(e) => setTempNotes(e.target.value)}
                                                        placeholder="Add your notes..."
                                                        className="w-full p-2 border border-border rounded-md bg-background text-foreground resize-none"
                                                        rows={3}
                                                    />
                                                    <div className="flex gap-2" >
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleSaveNotes(bookmark.id)}
                                                        >
                                                            Save
                                                        </Button>
                                                        < Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={handleCancelNotes}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-2" >
                                                    {
                                                        bookmark.notes ? (
                                                            <p className="text-sm text-muted-foreground italic p-2 bg-muted/20 rounded" >
                                                                &quot;{bookmark.notes}&quot;
                                                            </p>
                                                        ) : null}
                                                    < Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleEditNotes(bookmark)}
                                                        className="text-xs"
                                                    >
                                                        <FileText className="w-3 h-3 mr-1" />
                                                        {bookmark.notes ? 'Edit Notes' : 'Add Notes'}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Tags Section */}
                                        <div>
                                            {editingTags === bookmark.id ? (
                                                <div className="space-y-2" >
                                                    <input
                                                        type="text"
                                                        value={tempTags}
                                                        onChange={(e) => setTempTags(e.target.value)}
                                                        placeholder="Enter tags separated by commas..."
                                                        className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                                                    />
                                                    <div className="flex gap-2" >
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleSaveTags(bookmark.id)}
                                                        >
                                                            Save
                                                        </Button>
                                                        < Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={handleCancelTags}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 flex-wrap" >
                                                    {
                                                        bookmark.tags.length > 0 ? (
                                                            <>
                                                                {
                                                                    bookmark.tags.map((tag, index) => (
                                                                        <span
                                                                            key={index}
                                                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                                                                        >
                                                                            <Tag className="w-3 h-3 mr-1" />
                                                                            {tag}
                                                                        </span>
                                                                    ))
                                                                }
                                                            </>
                                                        ) : null
                                                    }
                                                    < Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleEditTags(bookmark)}
                                                        className="text-xs"
                                                    >
                                                        <Tag className="w-3 h-3 mr-1" />
                                                        {bookmark.tags.length > 0 ? 'Edit Tags' : 'Add Tags'}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground" >
                                            <div className="flex items-center gap-1" >
                                                <Calendar className="w-3 h-3" />
                                                <span>
                                                    Added {new Date(bookmark.dateAdded).toLocaleDateString()}
                                                </span>
                                            </div>
                                            < Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleBookmarkClick(bookmark)}
                                                className="text-xs text-primary hover:text-primary"
                                            >
                                                Go to Hadith →
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                    </div>
                )}
        </div>
    );
}