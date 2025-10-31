'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Tesseract from 'tesseract.js';
import Image from 'next/image';

interface OCRScannerProps {
    onTextExtracted: (text: string) => void;
    language?: string;
}

export function OCRScanner({ onTextExtracted, language = 'mal' }: OCRScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const getTesseractLang = (lang: string): string => {
        const langMap: { [key: string]: string } = {
            'mal': 'mal', // Malayalam
            'eng': 'eng', // English
            'ara': 'ara', // Arabic
            'urd': 'urd', // Urdu
            'hin': 'hin', // Hindi
            'ben': 'ben', // Bengali
            'tam': 'tam', // Tamil
        };
        return langMap[lang] || 'eng';
    };

    const processImage = async (file: File) => {
        setIsScanning(true);
        setProgress(0);

        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        try {
            const tesseractLang = getTesseractLang(language);

            const result = await Tesseract.recognize(file, tesseractLang, {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        setProgress(Math.round(m.progress * 100));
                    }
                },
            });

            const extractedText = result.data.text.trim();
            if (extractedText) {
                onTextExtracted(extractedText);
            } else {
                alert('No text found in image. Please try again with a clearer image.');
            }
        } catch (error) {
            console.error('OCR Error:', error);
            alert('Failed to extract text. Please try again.');
        } finally {
            setIsScanning(false);
            setProgress(0);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processImage(file);
        }
    };

    const clearPreview = () => {
        setPreviewImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
    };

    return (
        <div className="space-y-4">
            {previewImage && (
                <div className="relative border border-border rounded-lg overflow-hidden">
                    <Image
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-auto max-h-64 object-contain"
                    />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearPreview}
                        className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {isScanning && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Extracting text...</span>
                        <span className="text-primary font-medium">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-3">
                <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={isScanning}
                >
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                </Button>
                <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isScanning}
                >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                </Button>
            </div>

            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
            />
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />

            <p className="text-xs text-muted-foreground text-center">
                Supports: Malayalam, Arabic, English, Urdu, Hindi, Bengali, Tamil
            </p>
        </div>
    );
}