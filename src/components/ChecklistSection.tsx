import React, { useState, useRef } from 'react';
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  Camera,
  MessageSquare,
  Sparkles,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  Image as ImageIcon,
  ZoomIn,
  Loader2,
} from 'lucide-react';
import { InspectionItem, ItemEvaluation, ActiveTab, InspectionPhoto } from '../types/inspection';
import { compressImage } from '../utils/imageUtils';
import { PhotoLightboxModal } from './PhotoLightboxModal';

interface ChecklistSectionProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  items: InspectionItem[];
  evaluations: Record<string, ItemEvaluation>;
  onUpdateStatus: (itemId: string, status: 'pass' | 'fail' | 'na') => void;
  onUpdateNotes: (itemId: string, notes: string) => void;
  onAttachPhoto?: (itemId: string, photoUrl: string | undefined) => void;
  onAddPhoto?: (itemId: string, photo: InspectionPhoto) => void;
  onRemovePhoto?: (itemId: string, photoId: string) => void;
  monthlyToggles?: Record<string, boolean>;
  onToggleMonthly?: (toggleKey: string) => void;
  activeTab: ActiveTab;
}

export const ChecklistSection: React.FC<ChecklistSectionProps> = ({
  title,
  subtitle,
  badgeText,
  items,
  evaluations,
  onUpdateStatus,
  onUpdateNotes,
  onAttachPhoto,
  onAddPhoto,
  onRemovePhoto,
  monthlyToggles = {},
  onToggleMonthly,
}) => {
  const [expandedDrawers, setExpandedDrawers] = useState<Record<string, boolean>>({});
  const [processingPhoto, setProcessingPhoto] = useState<Record<string, boolean>>({});
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<{
    photo: InspectionPhoto;
    itemName: string;
    itemId: string;
  } | null>(null);

  const cameraInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const toggleDrawer = (id: string) => {
    setExpandedDrawers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper to extract all photos for an item, normalizing legacy photoUrl
  const getItemPhotos = (itemId: string, evalData: ItemEvaluation): InspectionPhoto[] => {
    if (evalData.photos && evalData.photos.length > 0) {
      return evalData.photos;
    }
    if (evalData.photoUrl) {
      return [
        {
          id: `photo-legacy-${itemId}`,
          dataUrl: evalData.photoUrl,
          timestamp: 'Initial Capture',
        },
      ];
    }
    return [];
  };

  const handleProcessFile = async (itemId: string, file: File) => {
    if (!file) return;

    setProcessingPhoto((prev) => ({ ...prev, [itemId]: true }));

    try {
      const compressedDataUrl = await compressImage(file, 1024, 0.78);
      const timestamp = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      const newPhoto: InspectionPhoto = {
        id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        dataUrl: compressedDataUrl,
        timestamp,
      };

      if (onAddPhoto) {
        onAddPhoto(itemId, newPhoto);
      } else if (onAttachPhoto) {
        onAttachPhoto(itemId, compressedDataUrl);
      }

      // Automatically keep the drawer open so user sees the newly added picture
      setExpandedDrawers((prev) => ({ ...prev, [itemId]: true }));
    } catch (err: any) {
      console.error('Error processing photo:', err);
      alert('Could not process photo: ' + (err?.message || 'Unsupported image format'));
    } finally {
      setProcessingPhoto((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleFileInputChange = (
    itemId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(itemId, file);
    }
    // Reset file input value so same photo can be re-selected if desired
    e.target.value = '';
  };

  const handleDeletePhoto = (itemId: string, photoId: string) => {
    if (onRemovePhoto) {
      onRemovePhoto(itemId, photoId);
    } else if (onAttachPhoto) {
      onAttachPhoto(itemId, undefined);
    }
  };

  const handleDrop = (itemId: string, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleProcessFile(itemId, file);
    }
  };

  return (
    <>
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
              {badgeText && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-950 border border-purple-700/50 text-purple-300">
                  {badgeText}
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          {items.map((item) => {
            const isMonthly = item.isMonthly;
            const isEnabled = !isMonthly || !!monthlyToggles[item.id];
            const evalData = evaluations[item.id] || { status: 'pending' };
            const status = evalData.status;
            const hasNotes = !!evalData.notes;
            const itemPhotos = getItemPhotos(item.id, evalData);
            const photoCount = itemPhotos.length;
            const isDrawerOpen = !!expandedDrawers[item.id] || (photoCount > 0 && !expandedDrawers[item.id] ? false : !!expandedDrawers[item.id]);
            const isProcessing = !!processingPhoto[item.id];

            return (
              <div
                key={item.id}
                id={`checklist-item-${item.id}`}
                className={`rounded-xl border transition-all p-3 sm:p-3.5 ${
                  !isEnabled
                    ? 'bg-slate-950/40 border-slate-850 opacity-60'
                    : status === 'pass'
                    ? 'bg-slate-800/40 border-emerald-500/30'
                    : status === 'fail'
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : 'bg-slate-800/60 border-slate-750'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Item Information */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isMonthly && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700">
                          <Sparkles className="w-3 h-3 text-indigo-400" />
                          Monthly Detail
                        </span>
                      )}

                      <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                        {item.name}
                      </h4>

                      {/* Photo indicator pill */}
                      {photoCount > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleDrawer(item.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/50 text-purple-300 hover:bg-purple-900/80 transition"
                          title="View attached station pictures"
                        >
                          <Camera className="w-3 h-3 text-purple-400" />
                          <span>
                            {photoCount} {photoCount === 1 ? 'Picture' : 'Pictures'}
                          </span>
                        </button>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Monthly Toggle or Status Actions */}
                  {isMonthly ? (
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-end sm:self-center">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <span className="text-xs font-semibold text-slate-300">
                          {isEnabled ? 'Included in Audit' : 'Include Monthly'}
                        </span>
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() => onToggleMonthly && onToggleMonthly(item.id)}
                          className="sr-only"
                        />
                        <div
                          className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                            isEnabled ? 'bg-purple-600' : 'bg-slate-700'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white transition-transform ${
                              isEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </div>
                      </label>

                      {/* If enabled, show Pass / Fail buttons + Photo button */}
                      {isEnabled && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onUpdateStatus(item.id, 'pass')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                              status === 'pass'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            Pass
                          </button>
                          <button
                            onClick={() => onUpdateStatus(item.id, 'fail')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                              status === 'fail'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            Fail
                          </button>

                          {/* Station Photo Button */}
                          <button
                            type="button"
                            onClick={() => toggleDrawer(item.id)}
                            className={`p-1.5 rounded-lg border text-xs transition flex items-center gap-1 ${
                              photoCount > 0
                                ? 'bg-purple-950 border-purple-500 text-purple-300'
                                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                            }`}
                            title="Add or view station pictures"
                          >
                            <Camera className="w-3.5 h-3.5 text-purple-400" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Standard Checklist item buttons */
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      {/* Pass button */}
                      <button
                        id={`btn-pass-${item.id}`}
                        onClick={() => onUpdateStatus(item.id, 'pass')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          status === 'pass'
                            ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                        }`}
                        title="Mark compliant"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Pass</span>
                      </button>

                      {/* Fail button */}
                      <button
                        id={`btn-fail-${item.id}`}
                        onClick={() => onUpdateStatus(item.id, 'fail')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          status === 'fail'
                            ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-400'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                        }`}
                        title="Flag deficiency"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-300" />
                        <span>Fail</span>
                      </button>

                      {/* N/A button */}
                      <button
                        id={`btn-na-${item.id}`}
                        onClick={() => onUpdateStatus(item.id, 'na')}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                          status === 'na'
                            ? 'bg-slate-700 text-slate-200 ring-1 ring-slate-500'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
                        }`}
                        title="Not applicable this shift"
                      >
                        <MinusCircle className="w-3 h-3" />
                        <span>N/A</span>
                      </button>

                      {/* Dedicated Add / View Station Photos Button */}
                      <button
                        type="button"
                        onClick={() => toggleDrawer(item.id)}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition flex items-center gap-1.5 ${
                          photoCount > 0
                            ? 'bg-purple-950/80 border-purple-500 text-purple-200 shadow-xs'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
                        }`}
                        title="Add pictures or notes for this station"
                      >
                        <Camera className={`w-3.5 h-3.5 ${photoCount > 0 ? 'text-purple-300' : 'text-purple-400'}`} />
                        <span className="text-[11px]">
                          {photoCount > 0 ? `${photoCount}` : 'Photo'}
                        </span>
                        {isDrawerOpen ? (
                          <ChevronUp className="w-3 h-3 text-slate-400 ml-0.5" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
                        )}
                      </button>

                      {/* Quick Notes Toggle if drawer is closed */}
                      <button
                        type="button"
                        onClick={() => toggleDrawer(item.id)}
                        className={`p-1.5 rounded-lg border text-xs transition flex items-center ${
                          hasNotes
                            ? 'bg-purple-950 border-purple-500 text-purple-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                        title="Add observation notes"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Station Pictures & Observation Notes Expandable Drawer */}
                {isEnabled && isDrawerOpen && (
                  <div
                    className="mt-3 pt-3 border-t border-slate-750/70 space-y-3"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(item.id, e)}
                  >
                    {/* Station Pictures Gallery Header & Triggers */}
                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4 text-purple-400" />
                          <span className="text-xs font-bold text-slate-200">
                            Station Pictures ({photoCount})
                          </span>
                          <span className="text-[10px] text-slate-400 hidden sm:inline">
                            Attached evidence for certified report
                          </span>
                        </div>

                        {/* Capture Action Buttons */}
                        <div className="flex items-center gap-2">
                          {/* Take photo with Camera */}
                          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold cursor-pointer transition shadow-xs active:scale-95">
                            <Camera className="w-3.5 h-3.5" />
                            <span>Take Photo</span>
                            <input
                              ref={(el) => (cameraInputRefs.current[item.id] = el)}
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={(e) => handleFileInputChange(item.id, e)}
                              className="sr-only"
                            />
                          </label>

                          {/* Browse Gallery or Files */}
                          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition active:scale-95">
                            <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                            <span>Browse Gallery</span>
                            <input
                              ref={(el) => (fileInputRefs.current[item.id] = el)}
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileInputChange(item.id, e)}
                              className="sr-only"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Processing indicator */}
                      {isProcessing && (
                        <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-purple-950/40 border border-purple-800/40 text-xs text-purple-300">
                          <Loader2 className="w-4 h-4 animate-spin text-purple-400 shrink-0" />
                          <span>Compressing and securing inspection photo...</span>
                        </div>
                      )}

                      {/* Photo Thumbnails Grid */}
                      {photoCount > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-1">
                          {itemPhotos.map((photo, pIndex) => (
                            <div
                              key={photo.id}
                              className="group relative aspect-square bg-slate-900 rounded-lg overflow-hidden border border-slate-700 hover:border-purple-500 transition shadow-sm flex flex-col justify-end"
                            >
                              <img
                                src={photo.dataUrl}
                                alt={`Station photo ${pIndex + 1}`}
                                referrerPolicy="no-referrer"
                                className="absolute inset-0 w-full h-full object-cover cursor-pointer group-hover:scale-105 transition duration-200"
                                onClick={() =>
                                  setActiveLightboxPhoto({
                                    photo,
                                    itemName: item.name,
                                    itemId: item.id,
                                  })
                                }
                              />

                              {/* Top Action Overlay */}
                              <div className="absolute top-1 right-1 flex items-center gap-1 z-10">
                                <button
                                  type="button"
                                  onClick={() => handleDeletePhoto(item.id, photo.id)}
                                  className="p-1 rounded-md bg-black/70 hover:bg-rose-900 text-slate-300 hover:text-rose-200 border border-white/10 transition"
                                  title="Delete picture"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Center Zoom Icon on Hover */}
                              <div
                                onClick={() =>
                                  setActiveLightboxPhoto({
                                    photo,
                                    itemName: item.name,
                                    itemId: item.id,
                                  })
                                }
                                className="absolute inset-0 bg-purple-950/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer pointer-events-auto"
                              >
                                <div className="p-1.5 rounded-full bg-black/70 text-white">
                                  <ZoomIn className="w-4 h-4" />
                                </div>
                              </div>

                              {/* Bottom Timestamp Pill */}
                              <div className="relative z-10 p-1 bg-gradient-to-t from-black/85 via-black/50 to-transparent pointer-events-none">
                                <span className="text-[10px] text-slate-300 font-mono block truncate">
                                  {photo.timestamp || `Photo ${pIndex + 1}`}
                                </span>
                              </div>
                            </div>
                          ))}

                          {/* Quick "+ Add Another Picture" Tile */}
                          <label className="aspect-square rounded-lg border-2 border-dashed border-slate-700 hover:border-purple-500 hover:bg-purple-950/20 transition flex flex-col items-center justify-center p-2 cursor-pointer text-center text-slate-400 hover:text-purple-300">
                            <Plus className="w-5 h-5 text-purple-400 mb-1" />
                            <span className="text-[11px] font-semibold">Add Picture</span>
                            <span className="text-[9px] text-slate-500">Camera or file</span>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={(e) => handleFileInputChange(item.id, e)}
                              className="sr-only"
                            />
                          </label>
                        </div>
                      ) : (
                        /* Empty state prompt for photos */
                        <div className="py-4 px-3 border border-dashed border-slate-800 rounded-lg text-center bg-slate-900/40">
                          <p className="text-xs text-slate-400">
                            No pictures attached yet for this station.
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Tap <strong>Take Photo</strong> to capture with camera, or drag & drop image files here.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Observation Note Input */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <div className="flex-1 w-full">
                        <input
                          type="text"
                          placeholder="Add observation note (e.g. restocked supplies, sanitized stall surfaces, polished mirror)..."
                          value={evalData.notes || ''}
                          onChange={(e) => onUpdateNotes(item.id, e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal for Full Resolution Photo Inspection */}
      {activeLightboxPhoto && (
        <PhotoLightboxModal
          photo={activeLightboxPhoto.photo}
          itemName={activeLightboxPhoto.itemName}
          onClose={() => setActiveLightboxPhoto(null)}
          onDelete={(photoId) => {
            handleDeletePhoto(activeLightboxPhoto.itemId, photoId);
            setActiveLightboxPhoto(null);
          }}
        />
      )}
    </>
  );
};
