import type { ReactNode } from 'react';

interface MainProps {
  readonly children: ReactNode;
}

export function Main({ children }: MainProps) {
  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      {children}
    </main>
  );
}
