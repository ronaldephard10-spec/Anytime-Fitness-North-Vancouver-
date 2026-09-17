import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  ExternalLink,
  X,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Camera,
  ShieldCheck,
  Building,
  User,
  Calendar,
  Clock,
  Printer,
} from 'lucide-react';
import { InspectionRecord, InspectionItem, ItemEvaluation, FACILITY_INFO } from '../types/inspection';
import { generateInspectionPDF } from '../utils/pdfGenerator';

interface CertificatePreviewModalProps {
  record: InspectionRecord;
  activeItems: InspectionItem[];
  onClose: () => void;
  onDownload: () => void;
}

export const CertificatePreviewModal: React.FC<CertificatePreviewModalProps> = ({
  record,
  activeItems,
  onClose,
  onDownload,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const { doc } = generateInspectionPDF(record, activeItems);
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (err) {
      console.error('Error generating PDF blob URL:', err);
    }
  }, [record, activeItems]);

  const handleOpenRawPdfInNewTab = () => {
    if (blobUrl) {
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
    } else {
      try {
        const { doc } = generateInspectionPDF(record, activeItems);
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener,noreferrer');
      } catch (e: any) {
        alert('Could not open PDF in new tab: ' + e?.message);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Collect all photos attached across active items
  const attachedPhotos: {
    stationName: string;
    status: string;
    notes?: string;
    dataUrl: string;
    timestamp?: string;
  }[] = [];

  activeItems.forEach((item) => {
    const evalData = record.items[item.id];
    if (!evalData) return;

    if (evalData.photos && evalData.photos.length > 0) {
      evalData.photos.forEach((p) => {
        attachedPhotos.push({
          stationName: item.name,
          status: evalData.status,
          notes: evalData.notes,
          dataUrl: p.dataUrl,
          timestamp: p.timestamp,
        });
      });
    } else if (evalData.photoUrl) {
      attachedPhotos.push({
        stationName: item.name,
        status: evalData.status,
        notes: evalData.notes,
        dataUrl: evalData.photoUrl,
        timestamp: 'Audit Snapshot',
      });
    }
  });

  const isPassing = record.score.percentage >= 85;

  return (
    <div
      id="certificate-preview-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="certificate-preview-modal-content"
        className="w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-700 rounded-2xl flex flex-col overflow-hidden shadow-2xl my-auto text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-purple-900/60 border border-purple-700/50 text-purple-300">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-white tracking-tight flex items-center gap-2">
                <span>Certified Inspection Document Preview</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                  Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400 hidden sm:block">
                Exact replica of the official audit certificate generated for management dispatch
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-2.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition hidden sm:flex items-center gap-1.5"
              title="Print certificate"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={handleOpenRawPdfInNewTab}
              className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5 active:scale-95"
              title="Open raw PDF file in a new browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Open in</span> New Tab
            </button>

            <button
              onClick={onDownload}
              className="px-3.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-xs active:scale-95"
              title="Download official PDF to device"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition ml-1"
              title="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Certificate Paper View */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-950/60">
          {/* Physical Sheet Simulation Container */}
          <div className="max-w-3xl mx-auto bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 overflow-hidden font-sans">
            {/* 1. Header Banner */}
            <div className="bg-[#4B286D] text-white p-6 sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-800/60 pb-3">
                <div>
                  <span className="text-[10px] tracking-widest uppercase font-mono font-bold text-purple-200">
                    OFFICIAL AUDIT CERTIFICATE
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
                    ANYTIME FITNESS • NORTH VANCOUVER
                  </h1>
                </div>
                <div className="text-left sm:text-right font-mono text-xs">
                  <span className="text-purple-200 block text-[10px] uppercase">Audit Reference</span>
                  <span className="font-bold text-white">AFNV-{record.id.slice(0, 8).toUpperCase()}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 text-xs text-purple-100">
                <span className="font-medium">
                  FACILITY SANITATION &amp; MAINTENANCE INSPECTION CERTIFICATE
                </span>
                <span className="text-[11px] text-purple-300 font-mono">
                  Clean Audit Pro System
                </span>
              </div>
            </div>

            {/* 2. Metadata & Facility Information Card */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                {/* Left Column: Facility Information */}
                <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-200 pb-3 md:pb-0 md:pr-4">
                  <div className="flex items-center gap-1.5 font-bold text-[#4B286D] uppercase tracking-wider text-[11px]">
                    <Building className="w-3.5 h-3.5 text-[#4B286D]" />
                    <span>Facility Metadata</span>
                  </div>
                  <p className="font-bold text-slate-800 text-sm">
                    {FACILITY_INFO.facility}
                  </p>
                  <p className="text-slate-600">
                    {FACILITY_INFO.address} • <span className="font-semibold text-emerald-800">Acct #{FACILITY_INFO.accountNumber}</span>
                  </p>
                  <p className="text-purple-900 font-medium pt-0.5 text-xs">
                    Schedule: 3x / Week (Tuesday, Thursday, Saturday at 11:00 PM — 156 Annual Visits)
                  </p>
                  <p className="text-slate-600 pt-0.5 text-xs">
                    <span className="font-semibold text-slate-700">Contact:</span> {FACILITY_INFO.contactName} ({FACILITY_INFO.contactPhone}) • Ref: Coverall Work Agreement #{FACILITY_INFO.accountNumber}
                  </p>
                </div>

                {/* Right Column: Inspection Details */}
                <div className="space-y-1.5 md:pl-2">
                  <div className="flex items-center gap-1.5 font-bold text-[#4B286D] uppercase tracking-wider text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#4B286D]" />
                    <span>Audit Particulars</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-slate-700">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Date &amp; Time</span>
                      <span className="font-semibold text-slate-800">{record.inspectionDate}</span>
                      <span className="block text-[11px] text-slate-500">{record.inspectionTime}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Shift</span>
                      <span className="font-bold text-[#4B286D] uppercase">{record.activeDay} Shift</span>
                      <span className="block text-[11px] text-slate-500">Scheduled: 11:00 PM</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Inspector</span>
                      <span className="font-semibold text-slate-800">{record.inspectorName || 'Lead Auditor'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400">Supervisor</span>
                      <span className="font-semibold text-slate-800">{record.supervisorName || 'Designated Shift Lead'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Compliance Rating Score Banner */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isPassing
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50/70 border-rose-300 text-rose-950'
                }`}
              >
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-600 block">
                    Certified Compliance Score
                  </span>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-3xl sm:text-4xl font-black tracking-tight">
                      {record.score.percentage}%
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold text-white ${
                        isPassing ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}
                    >
                      {isPassing ? 'PASSED CERTIFICATION' : 'ACTION REQUIRED'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-5 text-xs border-t sm:border-t-0 sm:border-l border-slate-300/70 pt-3 sm:pt-0 sm:pl-5">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-emerald-800">Passed</span>
                    <span className="font-bold text-emerald-700 text-base">{record.score.passedCount}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-rose-800">Deficient</span>
                    <span className="font-bold text-rose-700 text-base">{record.score.failedCount}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-600">N/A</span>
                    <span className="font-bold text-slate-600 text-base">{record.score.naCount}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-600">Total Scored</span>
                    <span className="font-bold text-slate-800 text-base">{record.score.totalScorable}</span>
                  </div>
                </div>
              </div>

              {/* 4. Itemized Checklist Evaluation Table */}
              <div>
                <div className="flex items-center justify-between pb-2 border-b-2 border-slate-900">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Station Checklist &amp; Service Verification
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {activeItems.length} Active Stations
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                        <th className="py-2.5 px-3 w-8">#</th>
                        <th className="py-2.5 px-3">Service Station / Task</th>
                        <th className="py-2.5 px-3 w-28">Category</th>
                        <th className="py-2.5 px-3 w-28">Evaluation</th>
                        <th className="py-2.5 px-3">Observation &amp; Evidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {activeItems.map((item, idx) => {
                        const evalData: ItemEvaluation =
                          record.items[item.id] || { id: item.id, status: 'pass' };
                        const st = evalData.status;
                        const itemPhotos = evalData.photos || (evalData.photoUrl ? [{ id: '1', dataUrl: evalData.photoUrl }] : []);
                        const photoCount = itemPhotos.length;

                        return (
                          <tr
                            key={item.id}
                            className={`transition-colors ${
                              idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                            }`}
                          >
                            <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">
                              {item.name}
                              {item.isMonthly && (
                                <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-purple-100 text-[#4B286D]">
                                  Monthly
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 uppercase text-[10px] font-bold">
                              {item.category}
                            </td>
                            <td className="py-2.5 px-3">
                              {st === 'pass' && (
                                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded text-[11px]">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  PASS
                                </span>
                              )}
                              {st === 'fail' && (
                                <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded text-[11px]">
                                  <XCircle className="w-3 h-3 text-rose-600" />
                                  FAIL
                                </span>
                              )}
                              {st === 'na' && (
                                <span className="inline-flex items-center gap-1 font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded text-[11px]">
                                  <MinusCircle className="w-3 h-3 text-slate-400" />
                                  N/A
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span>{evalData.notes || 'Verified compliant'}</span>
                                {photoCount > 0 && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                                    <Camera className="w-2.5 h-2.5" />
                                    {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 5. Supervisor Attestation & Signature Box */}
              <div className="p-4 sm:p-5 rounded-xl border border-slate-300 bg-slate-50 flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-2 flex-1 text-xs text-slate-700">
                  <div className="font-bold uppercase tracking-wider text-[#4B286D] text-[11px]">
                    Supervisor Attestation &amp; Audit Dispatch
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    I hereby certify that the after-hours cleaning and disinfection services for Anytime Fitness
                    North Vancouver were inspected and certified against required sanitation, cleanliness, and
                    facility quality standards.
                  </p>
                  <p className="text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-800">Auditor Notes:</span>{' '}
                    {record.overallNotes || 'Facility in exemplary condition. All core surfaces disinfected.'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Certified Email Target: {record.recipientTo || 'ronaldephard10@gmail.com'}
                    {record.recipientCc ? ` | Cc: ${record.recipientCc}` : record.recipientCc === '' ? '' : ' | Cc: ronald@marketingdo.net'}
                  </p>
                </div>

                {/* Signature Box */}
                <div className="w-full sm:w-56 shrink-0 border border-slate-300 rounded-lg p-3 bg-white flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Digital Signature
                    </span>
                    <div className="h-16 flex items-center justify-center border-b border-dashed border-slate-200">
                      {record.supervisorSignature ? (
                        <img
                          src={record.supervisorSignature}
                          alt="Supervisor Signature"
                          className="max-h-14 max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-slate-400 italic">Signature on file</span>
                      )}
                    </div>
                  </div>
                  <div className="pt-2 text-[10px] text-slate-600">
                    <p className="font-semibold text-slate-800 truncate">
                      {record.supervisorName || 'Shift Supervisor'}
                    </p>
                    <p className="text-slate-500 font-mono">
                      {record.signedAt || record.inspectionDate}
                    </p>
                  </div>
                </div>
              </div>

              {/* 6. Station Photo Evidence Appendix (if photos exist) */}
              {attachedPhotos.length > 0 && (
                <div className="pt-4 border-t-2 border-purple-900/40 space-y-4">
                  <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-[#4B286D]" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                        Station Photo Evidence Appendix ({attachedPhotos.length})
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                      Certified Audit Proof
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {attachedPhotos.map((evidence, pIdx) => (
                      <div
                        key={pIdx}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 flex items-start gap-3"
                      >
                        <img
                          src={evidence.dataUrl}
                          alt={evidence.stationName}
                          className="w-20 h-20 object-cover rounded-md border border-slate-300 shrink-0"
                        />
                        <div className="min-w-0 text-xs flex-1">
                          <p className="font-bold text-slate-900 text-[11px] leading-tight truncate">
                            {pIdx + 1}. {evidence.stationName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                evidence.status === 'pass'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {evidence.status === 'pass' ? '✓ PASS' : '✗ DEFICIENCY'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {evidence.timestamp || 'Logged'}
                            </span>
                          </div>
                          {evidence.notes && (
                            <p className="text-[10px] text-slate-600 mt-1 italic line-clamp-2">
                              "{evidence.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. Bottom Certificate Verification Footer */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 text-center sm:text-left gap-1">
                <span>Clean Audit Pro System • {FACILITY_INFO.facility}</span>
                <span>{FACILITY_INFO.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Document verified. Ready for download or email transmission.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenRawPdfInNewTab}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
              <span>Open in New Window</span>
            </button>
            <button
              onClick={onDownload}
              className="px-4 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
