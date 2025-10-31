'use client';

import { useState, useEffect } from 'react';
import { X, Save, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { OCRScanner } from './OCRScanner';
import type { ICombinedHadith } from '@/lib/types/hadith';

interface HadithEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    hadith: ICombinedHadith;
    bookKey: string;
    language: string;
    onSave: (hadithNumber: number, updatedText: string) => Promise<void>;
}

export function HadithEditorModal({
    isOpen,
    onClose,
    hadith,
    bookKey,
    language,
    onSave,
}: HadithEditorModalProps) {
    const [editedText, setEditedText] = useState('');
    const [showOCR, setShowOCR] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setEditedText(hadith.translation.text);
            setShowOCR(false);
        }
    }, [isOpen, hadith]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!editedText.trim()) {
            alert('Translation text cannot be empty');
            return;
        }

        setSaving(true);
        try {
            await onSave(hadith.arabic.hadithnumber, editedText);
            alert('Translation updated successfully!');
            onClose();
        } catch (error) {
            console.error('Save failed:', error);
            alert('Failed to save translation. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleOCRExtract = (text: string) => {
        if (editedText.trim()) {
            if (confirm('Replace current text with scanned text?')) {
                setEditedText(text);
            } else {
                setEditedText(editedText + '\n\n' + text);
            }
        } else {
            setEditedText(text);
        }
        setShowOCR(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-background border border-border rounded-lg shadow-xl max-w-4xl w-full my-8">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">
                            Edit Translation
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Hadith #{hadith.arabic.hadithnumber} • {bookKey} • {language.toUpperCase()}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Arabic Original (Read-only)
                        </label>
                        <div className="p-4 bg-muted/30 border border-border rounded-lg arabic-text text-right text-lg">
                            {hadith.arabic.text}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-foreground">
                            Translation Text
                        </label>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowOCR(!showOCR)}
                            className="text-primary"
                        >
                            <ScanLine className="w-4 h-4 mr-2" />
                            {showOCR ? 'Hide Scanner' : 'Scan Image'}
                        </Button>
                    </div>

                    {showOCR && (
                        <div className="p-4 bg-muted/20 border border-border rounded-lg">
                            <OCRScanner
                                onTextExtracted={handleOCRExtract}
                                language={language}
                            />
                        </div>
                    )}

                    <div>
                        <textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className="w-full h-64 p-4 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            placeholder="Enter or scan translation text..."
                            dir={language === 'ara' || language === 'urd' ? 'rtl' : 'ltr'}
                        />
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-muted-foreground">
                                Characters: {editedText.length}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Words: {editedText.trim().split(/\s+/).length}
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                            Current Translation (for reference)
                        </label>
                        <div className="p-4 bg-muted/10 border border-border rounded-lg text-sm text-muted-foreground">
                            {hadith.translation.text}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
                    <Button
                        variant="primary"
                        onClick={onClose}
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving || !editedText.trim()}
                        className="min-w-[120px]"
                    >
                        {saving ? (
                            <>
                                <span className="animate-spin mr-2">⏳</span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}