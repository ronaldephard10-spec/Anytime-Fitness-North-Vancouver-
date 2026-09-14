import React, { useRef, useState, useEffect } from 'react';
import { PenTool, RotateCcw, Check, UserCheck, ShieldAlert } from 'lucide-react';

interface SupervisorSignaturePadProps {
  inspectorName: string;
  onChangeInspectorName: (name: string) => void;
  supervisorName: string;
  onChangeSupervisorName: (name: string) => void;
  overallNotes: string;
  onChangeOverallNotes: (notes: string) => void;
  signatureDataUrl: string;
  onSaveSignature: (dataUrl: string) => void;
}

export const SupervisorSignaturePad: React.FC<SupervisorSignaturePadProps> = ({
  inspectorName,
  onChangeInspectorName,
  supervisorName,
  onChangeSupervisorName,
  overallNotes,
  onChangeOverallNotes,
  signatureDataUrl,
  onSaveSignature,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(!!signatureDataUrl);

  // Initialize canvas with previous signature if exists
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.strokeStyle = '#9333ea'; // Purple ink
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (signatureDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = signatureDataUrl;
      setHasDrawn(true);
    }
  }, []);

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSaveSignature(canvas.toDataURL('image/png'));
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onSaveSignature('');
  };

  return (
    <div
      id="supervisor-signoff-section"
      className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-md space-y-5"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-600/50 flex items-center justify-center text-purple-300">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Supervisor Sign-Off & Verification
            </h3>
            <p className="text-xs text-slate-400">
              Certifies completion of scheduled 11:00 PM cleaning and sanitation (Sun, Tue, Thu)
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-800 text-purple-300 border border-slate-700">
          Digital Attestation
        </span>
      </div>

      {/* Inspector & Supervisor Names Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Inspector / Lead Cleaner Name
          </label>
          <input
            type="text"
            value={inspectorName}
            onChange={(e) => onChangeInspectorName(e.target.value)}
            placeholder="e.g. Ronald Ephard / Clean Audit Specialist"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Supervisor / Reviewer Name
          </label>
          <input
            type="text"
            value={supervisorName}
            onChange={(e) => onChangeSupervisorName(e.target.value)}
            placeholder="e.g. Jennifer Johnson / Shift Supervisor"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
          />
        </div>
      </div>

      {/* Overall Audit Notes */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Overall Audit Observations & Handover Notes
        </label>
        <textarea
          rows={2}
          value={overallNotes}
          onChange={(e) => onChangeOverallNotes(e.target.value)}
          placeholder="e.g. All gym mirrors spot-cleaned, restrooms sanitized with hospital-grade disinfectant, and supply closet restocked."
          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-purple-500 leading-relaxed"
        />
      </div>

      {/* Digital Signature Canvas */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <PenTool className="w-3.5 h-3.5 text-purple-400" />
            <span>Digital Signature Pad (Draw with touch or mouse)</span>
          </label>

          <button
            onClick={clearCanvas}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear Signature</span>
          </button>
        </div>

        <div className="relative rounded-xl border border-slate-750 bg-slate-950 overflow-hidden touch-none">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-32 cursor-crosshair block"
          />

          {!hasDrawn && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-600 text-xs">
              <PenTool className="w-5 h-5 mb-1 opacity-40 text-purple-400" />
              <span>Sign above to certify inspection</span>
            </div>
          )}

          {/* Baseline line */}
          <div className="absolute bottom-6 left-8 right-8 border-b border-dashed border-slate-800 pointer-events-none" />
          <div className="absolute bottom-1 right-3 text-[10px] text-slate-500 font-mono pointer-events-none">
            ✕ Authorized Signatory
          </div>
        </div>

        {hasDrawn && (
          <p className="mt-1.5 text-[11px] text-emerald-400 flex items-center gap-1">
            <Check className="w-3 h-3" />
            Signature captured and encrypted into certified PDF report
          </p>
        )}
      </div>
    </div>
  );
};
