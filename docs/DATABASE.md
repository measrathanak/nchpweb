# Database Setup Guide

## Overview

The Next.js frontend uses **PostgreSQL** for structured data and **Redis** for caching/sessions. This is separate from TYPO3's MySQL database.

## What's Stored in Each Database

### PostgreSQL (Primary)
- **User Accounts** - Login credentials, profiles
- **Sessions** - User session tokens
- **Saved Articles** - User's bookmarked content
- **Form Submissions** - Contact forms, newsletter signups
- **User Preferences** - Theme, language, notification settings
- **Analytics** - Page views, user behavior tracking
- **Content Queue** - Background job queue

### Redis (Cache)
- Search results from Solr
- Session data (faster than PostgreSQL)
- Temporary data caches
- Rate limiting

### TYPO3 MySQL (Content Authority)
- All article content
- Categories and tags
- Media assets
- Navigation structure
- Solr search index

## Database Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Next.js Frontend                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────┐      ┌──────────────────┐    │
│  │  PostgreSQL      │      │  Redis (Cache)   │    │
│  │  Users, Sessions │      │  Session Data    │    │
│  │  Forms, Prefs    │      │  Search Cache    │    │
│  └──────────────────┘      └──────────────────┘    │
│                                                      │
├─────────────────────────────────────────────────────┤
│         Prisma ORM (Database Layer)                 │
├─────────────────────────────────────────────────────┤
│                                                      │
│            ┌──────────────────────────┐            │
│            │   TYPO3 CMS (MySQL)      │            │
│            │   Content Authority      │            │
│            │   Articles, Media, Cats  │            │
│            └──────────────────────────┘            │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Setup Instructions

### 1. Using Docker Compose (Recommended)

```bash
cd /Users/microstore/Documents/NPCH/website-next

# Start all services including PostgreSQL and Redis
./Script/start.sh
# or
docker-compose up -d

# Run database migrations
npm run db:migrate

# Seed sample data
npm run db:seed
```

### 2. Manual Local Setup

If you prefer to run locally without Docker:

**Install PostgreSQL:**
```bash
# macOS with Homebrew
brew install postgresql@16
brew services start postgresql@16

# Create database and user
createuser npch_user -P  # Set password to: npch_password
createdb -U npch_user npch_website
```

**Install Redis:**
```bash
# macOS with Homebrew
brew install redis
brew services start redis

# Verify Redis is running
redis-cli ping  # Should output: PONG
```

**Update `.env.local`:**
```env
DATABASE_URL="postgresql://npch_user:npch_password@localhost:5432/npch_website?schema=public"
REDIS_URL="redis://localhost:6379"
```

**Run migrations:**
```bash
npm run db:migrate
npm run db:seed
```

## Common Database Tasks

### View Database (Prisma Studio)
```bash
npm run db:studio
```
Opens http://localhost:5555 with visual database editor.

### Create a Migration
After modifying `prisma/schema.prisma`:
```bash
npm run db:migrate
# Follow prompts to name migration (e.g., "add_new_field")
```

### Reset Database (⚠️ Caution - Deletes all data)
```bash
npx prisma migrate reset
```

### Sync Schema to Database (No migration)
```bash
npm run db:push
```

### Seed Database with Sample Data
```bash
npm run db:seed
```

### Generate Prisma Client
```bash
npm run db:generate
```

## Database Schema Overview

### Users Table
```typescript
User {
  id: String (CUID)
  email: String (unique)
  name: String?
  password: String? (hashed)
  language: String (en, km)
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Sessions Table
```typescript
Session {
  id: String (CUID)
  sessionToken: String (unique)
  userId: String (foreign key)
  expires: DateTime
  createdAt: DateTime
}
```

### Saved Articles Table
```typescript
SavedArticle {
  id: String (CUID)
  userId: String (foreign key)
  typo3ArticleUid: Int (reference to TYPO3)
  title: String
  language: String (en, km)
  savedAt: DateTime
}
```

### Form Submissions Table
```typescript
FormSubmission {
  id: String (CUID)
  userId: String? (foreign key, optional)
  formType: String (contact, newsletter, feedback)
  formData: JSON (flexible form fields)
  email: String
  status: String (pending, reviewed, resolved)
  createdAt: DateTime
}
```

### Search Cache Table
```typescript
SearchCache {
  id: String (CUID)
  query: String
  language: String (en, km)
  results: JSON (Solr results)
  resultCount: Int
  expiresAt: DateTime
  hits: Int (how many times used)
}
```

## Using Databases in Code

### Fetch User with Sessions
```typescript
import { getUserById } from '@/lib/db-utils';

const user = await getUserById(userId);
console.log(user.sessions); // All active sessions
```

### Save Article for User
```typescript
import { saveArticle } from '@/lib/db-utils';

await saveArticle(userId, {
  typo3ArticleUid: 123,
  title: 'Article Title',
  slug: 'article-slug',
  language: 'km',
});
```

### Cache Search Results
```typescript
import { cacheSearch, getCachedSearch } from '@/lib/db-utils';

// Check cache first
let results = await getCachedSearch(query, 'en');

// If not cached, fetch from Solr and cache
if (!results) {
  const solrResults = await typo3API.searchArticles(query, 'en');
  await cacheSearch(query, 'en', solrResults, 24); // 24 hour cache
  results = solrResults;
}
```

### Submit Form
```typescript
import { submitForm } from '@/lib/db-utils';

await submitForm({
  formType: 'contact',
  email: 'user@example.com',
  name: 'John Doe',
  formData: {
    subject: 'Website Inquiry',
    message: 'Hello, I have a question...',
  },
  userId: currentUser?.id,
});
```

## Environment Variables

```env
# Connection strings
DATABASE_URL="postgresql://user:password@localhost:5432/database"
REDIS_URL="redis://localhost:6379"

# For Docker Compose
DATABASE_URL="postgresql://npch_user:npch_password@postgres:5432/npch_website?schema=public"
REDIS_URL="redis://redis:6379"
```

## Troubleshooting

### PostgreSQL Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:** Ensure PostgreSQL is running
```bash
# With Docker
docker-compose up -d postgres

# Local
brew services start postgresql@16
```

### Redis Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```
**Solution:** Ensure Redis is running
```bash
# With Docker
docker-compose up -d redis

# Local
brew services start redis
```

### Migration Failed
```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back "migration_name"

# Reset and try again
npx prisma migrate reset
```

### Prisma Client Out of Sync
```bash
# Regenerate Prisma Client
npm run db:generate
```

## Performance Tips

1. **Use Indexes** - Already defined in schema for common queries
2. **Cache Search Results** - Expires after 24 hours
3. **Limit Queries** - Use `take` and `skip` for pagination
4. **Use Sessions** - Store user data in Redis for fast access

## Security Notes

- ✅ Password hashing should use bcrypt (not included in seed)
- ✅ Session tokens are random 32-byte hex strings
- ✅ Sensitive data (PII) should use encryption at rest
- ✅ Database backups should be automated
- ✅ Credentials stored in `.env.local` (never committed)

## Monitoring

### View Query Logs
```bash
# In development, query logs appear in terminal
npm run dev
# Look for Prisma query logs
```

### Database Size
```bash
# Connect to PostgreSQL
psql -U npch_user -d npch_website

# Check table sizes
\dt+
```

### Cache Hit Rate
```typescript
// Search cache statistics
const stats = await prisma.searchCache.groupBy({
  by: ['query'],
  _sum: { hits: true },
});
```

## Backup and Restore

### Backup PostgreSQL
```bash
pg_dump -U npch_user npch_website > backup.sql
```

### Restore PostgreSQL
```bash
psql -U npch_user npch_website < backup.sql
```

## Related Documentation

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- See `.github/copilot-instructions.md` for development guidelines
