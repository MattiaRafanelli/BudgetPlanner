import React from 'react';

export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 max-w-7xl mx-auto">{children}</div>
    </div>
  );
}
