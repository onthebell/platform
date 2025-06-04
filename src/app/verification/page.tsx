// Verification page that redirects to the actual verification flow
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerificationPage() {
  const router = useRouter();

  useEffect(() => {
    // Client-side redirect to the actual verification page
    router.replace('/auth/verify-address');
  }, [router]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-gray-600">Redirecting to verification...</p>
      </div>
    </div>
  );
}
