import React from 'react';
import { Container } from '@/components/ui/Container';

export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center py-20" aria-live="polite" aria-busy="true">
      <Container className="text-center">
        <div className="relative mx-auto h-12 w-12 mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-[#8B5CF6]/30" />
          <div className="absolute inset-0 rounded-full border-2 border-[#34D399] border-t-transparent animate-spin" />
        </div>
        <p className="text-sm font-semibold text-[#A78BFA]">Loading reviewer content...</p>
      </Container>
    </div>
  );
}
