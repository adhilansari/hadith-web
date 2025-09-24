export const LANGUAGE_NAMES: Record<string, { name: string; nativeName: string }> = {
    'ara': { name: 'Arabic', nativeName: 'العربية' },
    'eng': { name: 'English', nativeName: 'English' },
    'urd': { name: 'Urdu', nativeName: 'اردو' },
    'tam': { name: 'Tamil', nativeName: 'தமிழ்' },
    'tur': { name: 'Turkish', nativeName: 'Türkçe' },
    'ind': { name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
    'fra': { name: 'French', nativeName: 'Français' },
    'rus': { name: 'Russian', nativeName: 'Русский' },
    'ben': { name: 'Bengali', nativeName: 'বাংলা' },
    'spa': { name: 'Spanish', nativeName: 'Español' },
    'chi': { name: 'Chinese', nativeName: '中文' },
    'ger': { name: 'German', nativeName: 'Deutsch' },
    'ita': { name: 'Italian', nativeName: 'Italiano' },
    'mal': { name: 'Malayalam', nativeName: 'മലയാളം' },
};

export function extractLanguageCode(collectionName: string): string {
    const match = collectionName.match(/^([a-z]{3})-/);
    return match ? match[1] : 'unknown';
}