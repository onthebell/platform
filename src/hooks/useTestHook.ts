'use client';

import { useState, useEffect } from 'react';

export function useTestHook() {
  console.log('🧪 Test hook initialized');

  const [count, setCount] = useState(0);
  const [isClient, setIsClient] = useState(false);

  console.log('🧪 Current count:', count, 'isClient:', isClient);

  // Check if we're on the client
  useEffect(() => {
    console.log('🧪 CLIENT-SIDE useEffect is running!');
    setIsClient(true);
    setCount(1);
  }, []);

  useEffect(() => {
    console.log('🧪 Count changed to:', count, 'on client:', isClient);
  }, [count, isClient]);

  // Force re-render immediately if we're on client
  if (typeof window !== 'undefined' && !isClient) {
    console.log('🧪 Detected client environment, forcing state update');
  }

  return { count, isClient };
}
