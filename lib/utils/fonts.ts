import { Inter, Noto_Naskh_Arabic } from 'next/font/google'

export const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
})

export const notoNaskhArabic = Noto_Naskh_Arabic({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
    display: 'swap',
    variable: '--font-noto-naskh-arabic',
})