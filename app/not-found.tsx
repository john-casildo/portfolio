import Link from 'next/link';

export default function RootNotFound() {
  return (
    <html lang="en">
      <body style={{margin: 0, minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#F2EFE8', color: '#0B0B0B', fontFamily: 'system-ui, sans-serif'}}>
        <main style={{textAlign: 'center'}}>
          <h1 style={{color: '#E10600', fontSize: 64, textShadow: '4px 4px 0 #0B0B0B'}}>GAME OVER</h1>
          <Link href="/">Continue?</Link>
        </main>
      </body>
    </html>
  );
}
