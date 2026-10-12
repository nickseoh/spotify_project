import LibraryApp from './components/library/LibraryApp'

// After logging in, users land straight on their playlists library.
// (Not logged in? LibraryApp redirects to /login.)
export default function Home() {
  return <LibraryApp />
}
