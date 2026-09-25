import React, { useEffect } from 'react';
import { X, Trash2, Camera, Clock, Download } from 'lucide-react';
import { InspectionPhoto } from '../types/inspection';

interface PhotoLightboxModalProps {
  photo: InspectionPhoto | null;
  itemName: string;
  onClose: () => void;
  onDelete?: (photoId: string) => void;
}

export const PhotoLightboxModal: React.FC<PhotoLightboxModalProps> = ({
  photo,
  itemName,
  onClose,
  onDelete,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!photo) return null;

  return (
    <div
      id="photo-lightbox-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-purple-950/80 border border-purple-500/30 text-purple-300 shrink-0">
              <Camera className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-100 truncate">{itemName}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>Captured: {photo.timestamp}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={photo.dataUrl}
              download={`Anytime_Fitness_Station_${photo.id}.jpg`}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-1"
              title="Download Photo"
            >
              <Download className="w-4 h-4" />
            </a>

            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Delete this inspection picture?')) {
                    onDelete(photo.id);
                    onClose();
                  }
                }}
                className="p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 transition"
                title="Delete Photo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Close viewer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Full Photo Display */}
        <div className="flex-1 bg-black/60 overflow-auto flex items-center justify-center p-2 sm:p-4 min-h-[300px]">
          <img
            src={photo.dataUrl}
            alt={`Inspection evidence for ${itemName}`}
            referrerPolicy="no-referrer"
            className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg border border-slate-800 shadow-lg"
          />
        </div>

        {/* Modal Footer Caption */}
        {photo.caption && (
          <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 text-xs text-slate-300">
            <span className="font-semibold text-purple-300">Note:</span> {photo.caption}
          </div>
        )}
      </div>
    </div>
  );
};
