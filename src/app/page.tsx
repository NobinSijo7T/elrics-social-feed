'use client';

import { useState, useEffect } from 'react';
import { TestConnection } from '../components/TestConnection';

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#090d16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#94a3b8', fontFamily: 'system-ui, sans-serif', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3ecf8e', display: 'inline-block' }} />
          Loading Supabase Mission Control...
        </div>
      </main>
    );
  }

  return (
    <main>
      <TestConnection />
    </main>
  );
}
