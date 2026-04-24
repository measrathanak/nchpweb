# NPCH Website - Next.js Frontend Copilot Instructions

## Project Overview

Next.js + TypeScript frontend for NPCH website with Khmer/English multilingual support, consuming TYPO3 as a headless API backend.

## Getting Started

### Prerequisites
- Node.js 18+, npm 9+
- Docker and Docker Compose (optional)
- TYPO3 backend running on localhost:8888

### Installation
1. Install dependencies: `npm install --legacy-peer-deps`
2. Copy environment: `cp .env.example .env.local`
3. Start development: `npm run dev` or `./Script/start.sh`

## Project Structure

- `src/app/[locale]/` - Language-specific routes (en, km)
- `src/components/` - React components (ArticleList, Header, LanguageSwitcher)
- `src/lib/` - Utilities (api.ts for TYPO3 client, i18n.ts for localization)
- `src/types/` - TypeScript types (Article, SearchResult, etc.)
- `docker-compose.yml` - Docker services setup
- `next.config.ts` - Next.js configuration with i18n routing
- `middleware.ts` - Locale routing middleware

## Key Technologies

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **next-intl** for i18n (Khmer/English)
- **axios** for TYPO3 API calls
- **Docker Compose** for containerized dev environment

## Environment Variables

- `NEXT_PUBLIC_TYPO3_API_URL` - TYPO3 REST API base URL (default: http://localhost:8888/typo3rest)
- `TYPO3_API_USER` / `TYPO3_API_PASSWORD` - API credentials
- `NEXT_PUBLIC_SOLR_URL` - Search engine URL (default: http://localhost:8983)
- `FRONTEND_PORT` - Development server port (default: 3000)

## Common Tasks

### Add a New Page
1. Create file: `src/app/[locale]/page-name/page.tsx`
2. Use `Locale` type from `src/lib/i18n.ts`
3. Example with API call:
```typescript
import typo3API from '@/lib/api';
import { Locale } from '@/lib/i18n';

export default async function Page({ params }: { params: { locale: Locale } }) {
  const data = await typo3API.getArticles(1, 10, params.locale);
  return <div>{/* render data */}</div>;
}
```

### Fetch TYPO3 Data
Use `src/lib/api.ts` TYPO3API client:
```typescript
import typo3API from '@/lib/api';

// Get articles
const articles = await typo3API.getArticles(page, limit, locale);

// Search
const results = await typo3API.searchArticles(query, locale);

// Single article
const article = await typo3API.getArticle(uid, locale);
```

### Add i18n Support
1. Define strings in `src/lib/i18n.ts` as translation maps
2. Use Locale parameter from `[locale]` route param
3. Example:
```typescript
const localeLabels: Record<Locale, string> = {
  en: 'English',
  km: 'ភាសាខ្មែរ'
};
```

## Docker Commands

```bash
./Script/start.sh          # Start all services
docker-compose down        # Stop services
docker-compose logs -f     # View logs
npm run docker:build       # Build image
```

## Common Issues

### Port 3000 in use
```bash
FRONTEND_PORT=3001 npm run dev
```

### TYPO3 API not responding
- Check TYPO3 is running: `curl http://localhost:8888/typo3rest/articles`
- Verify `NEXT_PUBLIC_TYPO3_API_URL` in `.env.local`

### Dependency conflicts
Use `npm install --legacy-peer-deps` due to next-intl/Next.js 16 compatibility

### Rebuild needed
```bash
rm -rf .next node_modules
npm install --legacy-peer-deps
npm run build
```

## TYPO3 Integration Notes

- Frontend expects TYPO3 REST endpoints under `/typo3rest/`
- Language mapping: 0=English, 1=Khmer
- Solr search on port 8983
- Middleware automatically handles `/locale/` routing

## Best Practices

1. Always use `Locale` type for locale parameters
2. Fetch TYPO3 data server-side in RSC (React Server Components)
3. Use `next/image` for image optimization
4. Utilize Tailwind CSS utility classes for styling
5. Create reusable components in `src/components/`
6. Keep types in `src/types/` organized by entity

## Build for Production

```bash
npm run build
npm run start
```

Or with Docker:
```bash
docker-compose build frontend
docker-compose up -d frontend
```

## Debugging

Enable Next.js debugging:
```bash
DEBUG=* npm run dev
```

Check Docker container logs:
```bash
docker-compose logs -f frontend
```

## Database Setup

The project uses PostgreSQL for data and Redis for caching. See [docs/DATABASE.md](../docs/DATABASE.md) for detailed setup instructions.

### Quick Database Commands
```bash
npm run db:migrate      # Create/apply database migrations
npm run db:seed         # Populate with sample data
npm run db:studio       # Open Prisma visual editor
npm run db:push         # Sync schema to database (no migration)
```

### Database Models
- **User** - User accounts and profiles
- **Session** - Active user sessions
- **SavedArticle** - User's bookmarked articles
- **FormSubmission** - Contact forms and submissions
- **SearchCache** - Cached Solr search results
- **PageView** - Analytics and page views
- **ContentQueue** - Background job queue
