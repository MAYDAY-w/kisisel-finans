import React from 'react';

export function Card({
  children,
  className = '',
  onClick,
  hover = false,
  padding = 'p-5',
}) {
  const hoverStyles = hover
    ? 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 cursor-pointer'
    : '';

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4)] text-slate-900 dark:text-slate-100 ${padding} ${hoverStyles} ${className}`}
    >
      {children}
    </div>
  );
}
