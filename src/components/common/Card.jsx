import React from 'react';

export function Card({
  children,
  className = '',
  onClick,
  hover = false,
  padding = 'p-5',
}) {
  const hoverStyles = hover
    ? 'hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer'
    : '';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] ${padding} ${hoverStyles} ${className}`}
    >
      {children}
    </div>
  );
}
