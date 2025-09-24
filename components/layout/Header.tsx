'use client';

import { useState } from 'react';
import { Menu, Moon, Sun, Monitor, Palette, Bookmark, MenuIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/search/SearchBar';
import { useTheme } from '@/lib/hooks/useTheme';
import { useBookmarks } from '@/lib/hooks/useBookmarks';
import { Sidebar } from './Sidebar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Header() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { theme, toggleBasicTheme, cycleColorThemes } = useTheme();
    const { bookmarksCount } = useBookmarks();
    const router = useRouter();

    const getThemeIcon = () => {
        switch (theme) {
            case 'light':
                return <Sun className="w-5 h-5" />;
            case 'dark':
                return <Moon className="w-5 h-5" />;
            case 'system':
                return <Monitor className="w-5 h-5" />;
            default:
                // For color themes, show palette icon
                return <Palette className="w-5 h-5" />;
        }
    };

    const getThemeColor = () => {
        switch (theme) {
            case 'blue':
                return 'text-blue-500';
            case 'emerald':
                return 'text-emerald-500';
            case 'purple':
                return 'text-purple-500';
            case 'orange':
                return 'text-orange-500';
            case 'rose':
                return 'text-rose-500';
            case 'teal':
                return 'text-teal-500';
            default:
                return 'text-muted-foreground';
        }
    };

    const handleBookmarksClick = () => {
        router.push('/bookmarks');
    };

    return (
        <>
            <header className="sticky top-0 z-40 w-full border-b border-border glassmorphism">
                <div className="container max-w-[75rem] mx-auto px-4">
                    <div className="flex h-16 items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden text-muted-foreground hover:text-primary"
                            >
                                <Menu className="w-5 h-5" />
                            </Button>

                            <Link href={'/'} className="text-xl font-bold gradient-text-primary whitespace-nowrap">
                                Hadith.net
                            </Link>
                        </div>

                        {/* Contextual Search Bar */}
                        <div className="flex-1 max-w-md mx-4">
                            <SearchBar compact={true} />
                        </div>

                        <div className="items-center hidden md:flex gap-2">
                            {/* Bookmarks Button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleBookmarksClick}
                                className="text-muted-foreground hover:text-primary transition-colors duration-200 relative"
                                title={`View bookmarks (${bookmarksCount})`}
                            >
                                <Bookmark className="w-5 h-5" />
                                {bookmarksCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                                        {bookmarksCount > 99 ? '99+' : bookmarksCount}
                                    </span>
                                )}
                            </Button>

                            {/* Theme Toggle Button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleBasicTheme}
                                className={`${getThemeColor()} hidden md:block hover:text-primary transition-colors duration-200`}
                                title={`Current: ${theme} theme - Click to toggle`}
                            >
                                {getThemeIcon()}
                            </Button>

                            {/* Color Theme Cycle Button (only show for color themes) */}
                            {!['light', 'dark', 'system'].includes(theme) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={cycleColorThemes}
                                    className="text-muted-foreground hidden md:block hover:text-primary transition-colors duration-200"
                                    title="Change color theme"
                                >
                                    <div className="w-3 h-3 rounded-full bg-current opacity-60" />
                                </Button>
                            )}

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSidebarOpen(true)}
                                className="text-muted-foreground hidden md:block hover:text-primary"
                            >
                                <MenuIcon className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </>
    );
}