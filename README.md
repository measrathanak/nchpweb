# NPCH Website - Next.js Frontend

A modern Next.js + TypeScript frontend for the NPCH website, consuming TYPO3 CMS as a headless API backend. Supports multilingual content (Khmer/English) with server-side rendering and static generation.

## Features

- ⚡ **Next.js 14+** with App Router and TypeScript
- 🌍 **Multilingual Support** - Khmer (km) and English (en) with i18n routing
- 📰 **Article/News Integration** - Powered by TYPO3 News extension API
- 🔍 **Search Functionality** - Integrated with Apache Solr search engine
- 🎨 **Tailwind CSS** - Responsive design with utility-first CSS
- 🐳 **Docker Support** - Local development with Docker Compose
- 🚀 **Performance Optimized** - Image optimization, ISR, static generation
- ♿ **Accessible** - WCAG 2.1 compliant components

## Project Structure

```
website-next/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── [locale]/     # Language-specific routes
│   │   │   ├── page.tsx  # Home page
│   │   │   ├── articles/ # Articles list
│   │   │   └── article/  # Article detail
│   │   └── api/          # API routes (optional)
│   ├── components/       # React components
│   ├── lib/              # Utility functions
│   ├── types/            # TypeScript types
│   ├── middleware.ts     # i18n routing middleware
│   └── globals.css       # Global styles
├── public/               # Static assets
├── docker_conf/          # Docker configuration
├── Script/               # Utility scripts
├── docker-compose.yml    # Docker Compose config
└── next.config.ts        # Next.js configuration
```

## Prerequisites

- **Node.js 18+** and **npm 9+**
- **Docker** and **Docker Compose** (for containerized development)
- Existing **TYPO3** backend running

## Quick Start

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

### 3. Development

**Local:**
```bash
npm run dev
```

**Docker:**
```bash
./Script/start.sh
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
NEXT_PUBLIC_TYPO3_API_URL=http://localhost:8888/typo3rest
TYPO3_API_USER=admin
TYPO3_API_PASSWORD=password
NEXT_PUBLIC_SOLR_URL=http://localhost:8983
FRONTEND_PORT=3000
```

## Available Scripts

```bash
npm run dev              # Development server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Lint code
npm run docker:build     # Build Docker image
npm run docker:up        # Start Docker services
npm run docker:down      # Stop Docker services
```

## TYPO3 Integration

This frontend expects TYPO3 to expose REST API endpoints:

- `/typo3rest/articles` - Article list
- `/typo3rest/articles/{uid}` - Single article
- `/typo3rest/search?q=query` - Search articles
- `/typo3rest/navigation` - Menu structure
- `/typo3rest/media/{id}` - Media assets

## Multilingual Support

Supports Khmer (km) and English (en) with automatic i18n routing:

- `/en/articles` - English articles
- `/km/articles` - Khmer articles

Language mapping uses TYPO3 language IDs:
- `0` = English
- `1` = Khmer

## Docker Services

- **frontend**: Next.js on port 3000
- **api**: TYPO3 backend on port 8888
- **solr**: Search engine on port 8983

## Performance

- Image optimization with Next.js Image component
- Static generation and ISR for articles
- Gzip compression enabled
- Tailwind CSS purging for minimal bundle

## Troubleshooting

### Port already in use
```bash
FRONTEND_PORT=3001 npm run dev
```

### Clear cache and rebuild
```bash
rm -rf .next node_modules
npm install --legacy-peer-deps
npm run build
```

### Check TYPO3 connection
```bash
curl http://localhost:8888/typo3rest/articles
```

## License

All rights reserved. NPCH Website.

---

**Built with ❤️ using Next.js + TYPO3**
