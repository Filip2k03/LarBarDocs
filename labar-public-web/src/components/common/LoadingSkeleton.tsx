import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number; className?: string }> = ({
  rows = 3,
  className = '',
}) => {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      <div className="h-6 bg-neutral-200 rounded-lg w-1/3"></div>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="h-16 bg-neutral-100 rounded-2xl w-full"></div>
      ))}
    </div>
  );
};
