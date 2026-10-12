This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Playlists library (home page)

After logging in, `/` opens the user's **Your Library** view (no separate home feed):

- **Sidebar** – the user's playlists with mosaic covers, search, and sort (Recents / Recently Added / Alphabetical). **+ Create** makes "My Playlist #N" and opens it.
- **Playlist page** – header with cover, name, owner, song count and total length; play / shuffle; "…" menu (Add songs, Edit details, Delete); search + sort inside the playlist; sortable song table with remove buttons.
- **Add songs** – "Let's find something for your playlist" search (also driven by the top search bar). Uses the iTunes Search API through `app/api/search/route.ts`, falling back to the sample catalog in `lib/catalog.ts` if that's unreachable.
- **Edit details** – name, description, cover image URL, public/private.
- **Player** – bottom bar + now-playing panel. iTunes songs play their 30-second preview; catalog songs are simulated with a timer.

### One-time database setup
Open Supabase → **SQL Editor**, paste `supabase/migrations/001_playlists_library.sql` and run it. It creates/upgrades `playlists` and creates `playlist_tracks`, with Row Level Security so each user only sees their own playlists.

### Where the code lives
| Path | What it does |
| --- | --- |
| `app/page.tsx` | Renders the library as the home page |
| `app/components/library/` | UI components (`LibraryApp` holds the state) + `library.module.css` |
| `lib/library.ts` | Supabase reads/writes for playlists and songs |
| `lib/types.ts`, `lib/format.ts` | Shared types and formatting helpers |
| `app/api/search/route.ts`, `lib/catalog.ts` | Song search |
