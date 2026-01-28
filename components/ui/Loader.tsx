import React from 'react';

interface LoaderProps {
  message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ message = "Processing..." }) => (
  <div className="flex flex-col items-center justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-4"></div>
    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">{message}</p>
  </div>
);