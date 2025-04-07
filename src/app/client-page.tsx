'use client';

import dynamic from 'next/dynamic';

// Use dynamic import with no SSR for the ChatPage component
// This is necessary because it uses browser-specific APIs
const ChatPage = dynamic(() => import('@/components/ChatPage'), {
  ssr: false,
});

export default function ClientPage() {
  return <ChatPage />;
}