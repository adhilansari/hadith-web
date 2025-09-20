// lib/types/hadith.ts
export interface IEditionsRes {
    abudawud: IEdition;
    bukhari: IEdition;
    dehlawi: IEdition;
    ibnmajah: IEdition;
    malik: IEdition;
    muslim: IEdition;
    nasai: IEdition;
    nawawi: IEdition;
    qudsi: IEdition;
    tirmidhi: IEdition;
}

export interface IEdition {
    name: string;
    collection: ICollection[];
}

export interface ICollection {
    name: string;
    book: string;
    author: string;
    language: string;
    has_sections: boolean;
    direction: string;
    source: string;
    comments: string;
    link: string;
    linkmin: string;
}

export interface IHadithRes {
    metadata: IMetadata;
    hadiths: IHadith[];
}

export interface IHadith {
    hadithnumber: number;
    arabicnumber: number;
    text: string;
    grades?: IGrade[];
    reference?: IReference;
}

export interface IReference {
    book: number;
    hadith: number;
}

export interface IGrade {
    name: string;
    grade: string;
}

export interface IMetadata {
    name: string;
    sections: Record<string, string>;
    section_details: Record<string, ISectionDetail>;
}

export interface ISectionDetail {
    hadithnumber_first: number;
    hadithnumber_last: number;
    arabicnumber_first: number;
    arabicnumber_last: number;
}

export interface ICombinedHadith {
    arabic: IHadith;
    translation: IHadith;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system' | 'emerald' | 'purple' | 'blue' | 'orange' | 'rose' | 'teal';

// Settings interface
export interface ISettings {
    theme: Theme;
    language: string;
    fontSize: 'small' | 'medium' | 'large';
    arabicFontSize: 'small' | 'medium' | 'large';
}

// Extended settings for the store
export interface IExtendedSettings extends ISettings {
    // Reading preferences
    showGrades: boolean;
    showReferences: boolean;
    showArabicNumbers: boolean;
    autoScrollToNext: boolean;

    // Accessibility
    highContrast: boolean;
    reducedMotion: boolean;

    // App preferences
    compactMode: boolean;
    showBookmarks: boolean;
    enableNotifications: boolean;

    // Data management
    lastSyncTime: number;
    cacheSize: number;
}

// Language options
export interface ILanguageOption {
    code: string;
    name: string;
    nativeName: string;
}

// Font size options
export type FontSizeOption = 'small' | 'medium' | 'large';

// Cache item interface
export interface ICacheItem<T> {
    data: T;
    timestamp: number;
    accessCount: number;
    lastAccessed: number;
}

// Cache statistics
export interface ICacheStats {
    totalItems: number;
    totalSize: number;
    oldestItem: number;
    newestItem: number;
}

// API response types
export interface IApiResponse<T> {
    data?: T;
    error?: string;
    status: number;
}

// Book statistics
export interface IBookStats {
    totalHadiths: number;
    totalSections: number;
    languages: string[];
    author: string;
}

// User preferences for bookmarks
export interface IBookmark {
    id: string;
    bookName: string;
    hadithNumber: number;
    arabicNumber: number;
    sectionId: string;
    sectionName: string;
    createdAt: number;
    note?: string;
}

// Search result interface
export interface ISearchResult {
    hadith: ICombinedHadith;
    bookName: string;
    sectionName: string;
    relevanceScore: number;
}

// PWA install prompt interface
export interface IBeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

// Notification options
export interface INotificationOptions {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    renotify?: boolean;
    requireInteraction?: boolean;
}

// Error boundary state
export interface IErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: React.ErrorInfo;
}