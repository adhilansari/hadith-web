# Hadith.net - Modern Islamic Hadith PWA

A beautiful, responsive Progressive Web App built with Next.js 15 and Tailwind CSS v4 for reading authentic Islamic Hadith collections with translations.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-hadithnet.vercel.app-blue?style=for-the-badge)](https://hadithnet.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-green?style=flat)](https://web.dev/progressive-web-apps/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat&logo=vercel)](https://vercel.com)

## ✨ Features

- **📱 Progressive Web App**: Installable, offline-capable, fast loading
- **🌙 Advanced Theming**: Light/Dark modes + Blue/Emerald/Purple color themes
- **🌍 Multi-language Support**: English, Arabic, Urdu, Turkish, Indonesian translations
- **📖 Complete Collections**: Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasai, Ibn Majah, and more
- **⚡ Smart Caching**: Advanced client-side caching with automatic cleanup
- **🎨 Modern UI**: Glass morphism, animations, responsive design
- **♿ Accessible**: ARIA labels, keyboard navigation, screen reader support
- **🔍 Authentic Grading**: Scholarly authenticity grades for each hadith

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4 with custom variants
- **State Management**: Zustand with persistence
- **Data Fetching**: SWR with smart caching
- **PWA**: next-pwa with custom service worker
- **Icons**: Lucide React
- **Fonts**: Inter (UI) + Amiri (Arabic)

## 📁 Project Structure

```
hadith-net/
├── app/
│   ├── layout.tsx              # Root layout with theme provider
│   ├── page.tsx               # Home page with book collection grid
│   ├── manifest.ts            # PWA manifest configuration
│   ├── books/
│   │   └── [book]/
│   │       ├── page.tsx       # Book sections page
│   │       └── [section]/
│   │           └── page.tsx   # Individual hadith display
│   └── api/
│       ├── hadith/route.ts    # Hadith data API endpoint
│       └── editions/route.ts  # Book editions API endpoint
├── components/
│   ├── layout/
│   │   ├── Header.tsx         # Navigation header with theme toggle
│   │   ├── Sidebar.tsx        # Settings sidebar panel
│   │   └── ThemeProvider.tsx  # Theme management provider
│   ├── hadith/
│   │   ├── HadithCard.tsx     # Individual hadith display card
│   │   ├── HadithList.tsx     # List of hadiths with loading states
│   │   └── BookCard.tsx       # Book collection display cards
│   └── ui/
│       ├── Button.tsx         # Reusable button component
│       ├── Card.tsx          # Base card component with variants
│       └── Loading.tsx       # Loading spinners and skeletons
├── lib/
│   ├── api/
│   │   ├── hadith.ts         # API client with caching
│   │   └── cache.ts          # Advanced cache management system
│   ├── hooks/
│   │   ├── useHadith.ts      # SWR hooks for hadith data
│   │   ├── useTheme.ts       # Enhanced theme management hook
│   │   └── useSettings.ts    # Settings state management
│   ├── utils/
│   │   └── helpers.ts        # Utility functions and theme helpers
│   └── types/
│       └── hadith.ts         # TypeScript interfaces and types
├── public/
│   ├── icons/               # PWA icons (72x72 to 512x512)
│   ├── sw.js               # Custom service worker
│   └── offline.html        # Offline fallback page
├── styles/
│   └── globals.css         # Global styles with CSS custom properties
├── next.config.mjs         # Next.js configuration with PWA setup
├── tailwind.config.ts      # Tailwind CSS v4 configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm

### Installation

1. **Clone and install dependencies:**

```bash
git clone https://github.com/yourusername/hadith-net.git
cd hadith-net
npm install
```

2. **Run development server:**

```bash
npm run dev
```

3. **Build for production:**

```bash
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📖 API Integration

The app integrates with the Hadith Database API:

- **Editions**: `https://cdn.jsdelivr.net/gh/adhilansari/hadithDb@v2/editions.min.json`
- **Arabic Data**: `https://cdn.jsdelivr.net/gh/adhilansari/hadithDb@v1/data/ara-{book}.json`
- **Translations**: `https://cdn.jsdelivr.net/gh/adhilansari/hadithDb@v1/translations/{lang}-{book}.json`

### Supported Collections:

- Sahih Bukhari (7,563 hadith)
- Sahih Muslim (3,033 hadith)
- Sunan Abu Dawud (5,274 hadith)
- Jami Tirmidhi (3,960 hadith)
- Sunan Nasai (5,758 hadith)
- Sunan Ibn Majah (4,341 hadith)
- Muwatta Malik (1,720 hadith)
- 40 Hadith Nawawi (42 hadith)
- 40 Hadith Qudsi (40 hadith)
- 40 Hadith Shah Waliullah Dehlawi (417 hadith)

## 🎨 Theming System

### Built-in Themes:

- **Light Mode**: Clean white background with blue accents
- **Dark Mode**: Rich dark background with blue accents
- **System**: Automatically follows OS preference
- **Ocean Blue**: Dark mode with blue gradient accents
- **Forest Green**: Dark mode with emerald gradient accents
- **Royal Purple**: Dark mode with purple gradient accents

### Custom CSS Properties:

The theme system uses CSS custom properties for dynamic color switching:

```css
:root {
  --primary: 199 89% 48%;
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}
```

## 💾 Caching Strategy

### Multi-Level Caching:

1. **Service Worker**: Caches API responses and static assets
2. **Local Storage**: Smart cache with LRU eviction policy
3. **SWR**: In-memory cache with revalidation
4. **Browser Cache**: Static assets with long-term caching

### Cache Features:

- Automatic cleanup of old entries
- Access-based priority system
- Offline-first API responses
- 30-day cache duration

## ♿ Accessibility Features

- **ARIA Labels**: Comprehensive screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Visible focus indicators
- **High Contrast**: Support for high contrast mode
- **Reduced Motion**: Respects motion preferences
- **Semantic HTML**: Proper heading hierarchy and landmarks

## 📱 PWA Features

- **Installable**: Add to home screen on mobile/desktop
- **Offline Support**: Works without internet connection
- **Fast Loading**: Service worker caching
- **Native Feel**: Standalone display mode
- **Auto Updates**: Background app updates

## 🔧 Configuration

### Environment Variables:

```env
NEXT_PUBLIC_APP_NAME="Hadith.net"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

### PWA Configuration:

- Manifest with all required fields
- Custom service worker with API caching
- Offline fallback page
- Multiple icon sizes (72px to 512px)

## 🛡 Performance Optimizations

- **Static Generation**: Pre-rendered pages for better SEO
- **Image Optimization**: Next.js Image component
- **Bundle Splitting**: Automatic code splitting
- **Tree Shaking**: Remove unused code
- **Compression**: Gzip/Brotli compression
- **Lazy Loading**: Components and images load on demand

## 📚 Usage Examples

### Reading Hadiths:

1. Select a collection from the home page
2. Choose a section/chapter
3. Read Arabic text with translation
4. View authenticity grades and references
5. Bookmark or share hadiths

### Customization:

- Change theme in settings sidebar
- Select translation language
- Adjust text size for Arabic and translations
- Toggle between light/dark modes

## 📊 Data Sources

All Hadith collections are sourced from the comprehensive repository by adhilansari:

- **Source**: [github.com/adhilansari/hadithDb](https://github.com/adhilansari/hadithDb)
- **Author**: adhilansari
- **API Version**: v2 (editions), v1 (data)
- **License**: Open source collection of authentic Islamic texts

_Note: This is an updated version of the original [fawazahmed0](https://github.com/fawazahmed0/hadiths) repository with enhanced API structure and additional language support. Special recognition goes to fawazahmed0 for the foundational work in compiling and organizing these hadith collections._

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines

1. Fork the repository
2. Create a feature branch
3. Make your changes following the existing code style
4. Test thoroughly across different devices and browsers
5. Submit a pull request with clear description

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **Data Source**: Hadith Database by adhilansari (updated from fawazahmed0's original work)
- **Islamic Scholars**: Recognition to all scholars and translators who preserved these sacred texts
- **Fonts**: Amiri Arabic font, Inter UI font
- **Icons**: Lucide React icon library
- **Framework**: Next.js and Vercel team
- **Community**: Open-source community for tools and libraries

## 🐛 Issues and Support

If you encounter any issues or have suggestions for improvement:

1. Check the [existing issues](https://github.com/yourusername/hadith-net/issues)
2. Create a new issue with detailed information
3. Provide browser/device information and steps to reproduce

## 🔗 Links

- **Live Application**: [hadithnet.vercel.app](https://hadithnet.vercel.app/)
- **Data Source**: [github.com/adhilansari/hadithDb](https://github.com/adhilansari/hadithDb)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **Tailwind CSS v4**: [tailwindcss.com](https://tailwindcss.com)

---

**Built with ❤️ for the Muslim community worldwide**
