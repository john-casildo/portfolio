import Link from 'next/link';

export default function RootNotFound() {
  return (
    <html lang="en">
      <body style={{margin: 0, minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#F3C98B', color: '#111', fontFamily: 'system-ui, sans-serif'}}>
        <main style={{textAlign: 'center'}}>
          <h1>GAME OVER</h1>
          <Link href="/">Continue?</Link>
        </main>
      </body>
    </html>
  );
}
