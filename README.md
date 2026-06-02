# Private Screenshot Feed

An MVP dashboard that turns private phone screenshots into a factual, news-feed-style
dashboard. Upload a screenshot, analyze it with an AI vision model, categorize it,
link to a visible source URL when possible, and expose a private RSS feed.

## What it does

- Private passcode-protected dashboard
- Screenshot upload from mobile or desktop
- Factual AI summary, title, topics, category, source URL, and confidence
- Existing categories are updated instead of duplicated
- Category pages show item counts and last-updated timestamps
- Private RSS feed at `/rss/{token}` or `/rss?token={token}`
- Runs locally with JSON/file storage by default
- Uses Supabase storage/database when Supabase environment variables are set

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and sign in with:

```text
demo-pass
```

The local fallback stores metadata in `.data/db.json` and uploaded screenshots in
`public/uploads`. Both are ignored by git.

## Environment variables

Create `.env.local` for a private deployment:

```bash
APP_PASSWORD="replace-with-a-long-private-passcode"
RSS_TOKEN="replace-with-a-separate-private-rss-token"
NEXT_PUBLIC_APP_URL="https://your-app.example.com"

# AI analysis
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4.1-mini"

# Optional Supabase persistence
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="..."
SUPABASE_STORAGE_BUCKET="screenshots"
```

If `OPENAI_API_KEY` is missing, uploads are still saved privately and marked as
pending analysis.

If Supabase variables are missing, the app uses local storage. To use Supabase,
run `supabase/schema.sql` in your project and create the configured storage bucket.

## Privacy notes

- Screenshots and metadata are private behind `APP_PASSWORD`.
- The RSS feed is token-protected and sends `Cache-Control: private, no-store`.
- The current Supabase storage helper uses bucket public URLs for image display.
  For a stricter production setup, use a private bucket and serve signed URLs from
  authenticated routes.
- The AI prompt instructs the model to stay factual and avoid inventing details or
  URLs that are not visible in the screenshot.

## Routes

- `/login` - passcode login
- `/dashboard` - private screenshot feed
- `/upload` - screenshot upload
- `/category/[slug]` - category detail feed
- `/rss/[token]` - private RSS feed
- `/rss?token=...` - redirecting RSS token option