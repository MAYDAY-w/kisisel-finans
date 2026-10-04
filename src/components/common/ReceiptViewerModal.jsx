import React, { useState, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

export function ReceiptViewerModal({
  isOpen,
  onClose,
  receipt, // { url, name, uploadedAt, description, amountFormatted }
}) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !receipt) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = receipt.url;
    link.download = `fis-${receipt.name || 'goruntu'}.jpg`;
    link.click();
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-6 transition-opacity">
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Lightbox Card */}
      <div
        className="relative z-10 max-w-4xl w-full max-h-[95vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 text-white shrink-0">
          <div className="min-w-0 pr-3">
            <h3 className="text-sm font-bold truncate text-slate-100">
              {receipt.description || receipt.name || 'Fiş Görseli'}
            </h3>
            {receipt.amountFormatted && (
              <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                {receipt.amountFormatted}
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={handleZoomOut}
              title="Uzaklaştır"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-400 font-mono w-10 text-center select-none">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              title="Yakınlaştır"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleRotate}
              title="Döndür"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              title="İndir"
              className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Kapat"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Preview Container */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950 select-none min-h-[300px] max-h-[75vh]">
          <img
            src={receipt.url}
            alt={receipt.name || 'Fiş Görseli'}
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: 'transform 0.15s ease-out',
            }}
            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg cursor-grab active:cursor-grabbing"
            draggable={false}
          />
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
          <span>{receipt.name || 'Fiş'}</span>
          {receipt.sizeKb && <span>~{receipt.sizeKb} KB</span>}
        </div>
      </div>
    </div>
  );
}
