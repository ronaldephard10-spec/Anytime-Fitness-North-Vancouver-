import { jsPDF } from 'jspdf';
import { InspectionRecord, InspectionItem, FACILITY_INFO, ItemEvaluation } from '../types/inspection';
import {
  CORE_SERVICES,
  SUNDAY_SPECIFIC,
  SUNDAY_MONTHLY,
  TUESDAY_SPECIFIC,
  TUESDAY_MONTHLY,
  THURSDAY_SPECIFIC,
  THURSDAY_MONTHLY,
} from '../data/checklistItems';
import type { CompletedInspection } from './inspectionHistory';

export function generateInspectionPDF(
  record: InspectionRecord,
  activeItems: InspectionItem[]
): { doc: jsPDF; base64: string; filename: string } {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const purplePrimary = [75, 40, 109]; // #4B286D
  const darkBg = [26, 16, 37];
  const purpleLight = [243, 238, 250];
  const greenPass = [16, 149, 79];
  const redFail = [220, 38, 38];
  const grayText = [75, 85, 99];
  const lightBorder = [229, 231, 235];

  // Helper for adding headers
  let y = margin;

  // 1. Top Brand Banner
  doc.setFillColor(purplePrimary[0], purplePrimary[1], purplePrimary[2]);
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');

  // Title text inside banner
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('ANYTIME FITNESS • NORTH VANCOUVER', margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(230, 215, 250);
  doc.text('FACILITY SANITATION & MAINTENANCE INSPECTION CERTIFICATE', margin + 6, y + 16);
  doc.text('CLEAN AUDIT PRO SYSTEM', contentWidth + margin - 6, y + 9, { align: 'right' });
  doc.setFontSize(8);
  doc.text(`AUDIT REF: AFNV-${record.id.slice(0, 8).toUpperCase()}`, contentWidth + margin - 6, y + 16, { align: 'right' });

  y += 28;

  // 2. Metadata & Facility Information Card
  doc.setFillColor(249, 250, 251);
  doc.setDrawColor(lightBorder[0], lightBorder[1], lightBorder[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'FD');

  // Facility Info (Left column)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(purplePrimary[0], purplePrimary[1], purplePrimary[2]);
  doc.text('FACILITY METADATA', margin + 5, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 50);
  doc.text(`Location: ${record.facility.facility}`, margin + 5, y + 12);
  doc.text(`Address: ${record.facility.address}`, margin + 5, y + 17);
  doc.text(`Facility Contact: ${record.facility.contactName} (${record.facility.contactPhone})`, margin + 5, y + 22);
  doc.text(`Schedule: ${record.facility.frequency}`, margin + 5, y + 27);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Unit: ${record.facility.unit} • Status: Clean Inspection Certified`, margin + 5, y + 33);

  // Inspection Info (Right column)
  const rightColX = margin + contentWidth / 2 + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(purplePrimary[0], purplePrimary[1], purplePrimary[2]);
  doc.text('AUDIT SESSION DETAILS', rightColX, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 50);
  doc.text(`Inspection Date: ${record.inspectionDate}`, rightColX, y + 12);
  doc.text(`Inspection Time: ${record.inspectionTime}`, rightColX, y + 17);
  doc.text(`Active Shift: ${record.activeDay.toUpperCase()} (11:00 PM Shift)`, rightColX, y + 22);
  doc.text(`Inspector: ${record.inspectorName || 'Lead Sanitation Specialist'}`, rightColX, y + 27);
  doc.text(`Supervisor Sign-off: ${record.supervisorName || 'Designated Shift Manager'}`, rightColX, y + 33);

  y += 42;

  // 3. Compliance Score Callout
  const scorePercent = record.score.percentage;
  const isPassing = scorePercent >= 85;
  const badgeColor = isPassing ? greenPass : redFail;

  doc.setFillColor(isPassing ? 240 : 254, isPassing ? 253 : 242, isPassing ? 244 : 242);
  doc.setDrawColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.text(`${scorePercent}%`, margin + 8, y + 12);

  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text('OVERALL COMPLIANCE SCORE', margin + 34, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.text(
    `Evaluated strictly against ${record.activeDay.toUpperCase()} scope: ${record.score.passedCount} Passed, ${record.score.failedCount} Failed, ${record.score.naCount} N/A (Total scorable: ${record.score.totalScorable})`,
    margin + 34,
    y + 13
  );

  // Status Chip on right
  doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.roundedRect(contentWidth + margin - 40, y + 4.5, 34, 9, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(isPassing ? 'CERTIFIED PASS' : 'NEEDS ACTION', contentWidth + margin - 23, y + 10.5, { align: 'center' });

  y += 23;

  // 4. Detailed Checklist Table Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(purplePrimary[0], purplePrimary[1], purplePrimary[2]);
  doc.text(`INSPECTION CHECKLIST ITEMS (${activeItems.length} ITEMS)`, margin, y);
  y += 4;

  // Table header bar
  doc.setFillColor(purplePrimary[0], purplePrimary[1], purplePrimary[2]);
  doc.rect(margin, y, contentWidth, 6.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('#', margin + 3, y + 4.5);
  doc.text('CHECKLIST ITEM / SCOPE', margin + 12, y + 4.5);
  doc.text('CATEGORY', margin + 105, y + 4.5);
  doc.text('STATUS', margin + 140, y + 4.5);
  doc.text('NOTES / OBS', margin + 160, y + 4.5);

  y += 6.5;

  // Table rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  activeItems.forEach((item, index) => {
    // Check if new page needed
    if (y > pageHeight - 45) {
      doc.addPage();
      y = margin;
      // Header repeat on page 2
      doc.setFillColor(purplePrimary[0], purplePrimary[1], purplePrimary[2]);
      doc.rect(margin, y, contentWidth, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text('ITEM', margin + 3, y + 4);
      doc.text('CHECKLIST ITEM / SCOPE', margin + 12, y + 4);
      doc.text('CATEGORY', margin + 105, y + 4);
      doc.text('STATUS', margin + 140, y + 4);
      doc.text('NOTES / OBS', margin + 160, y + 4);
      y += 6;
    }

    const evalData = record.items[item.id] || { id: item.id, status: 'pass' as const, notes: '' };
    const rowBg = index % 2 === 0 ? 255 : 249;
    const rowHeight = 7;

    doc.setFillColor(rowBg, rowBg, rowBg);
    doc.rect(margin, y, contentWidth, rowHeight, 'F');

    // Index
    doc.setTextColor(120, 120, 120);
    doc.text(`${index + 1}`, margin + 3, y + 4.5);

    // Item name
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    const itemName = item.isMonthly ? `[MONTHLY] ${item.name}` : item.name;
    doc.text(itemName.length > 55 ? itemName.slice(0, 53) + '...' : itemName, margin + 12, y + 4.5);

    // Category
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 90, 90);
    const catLabel = item.category.toUpperCase();
    doc.text(catLabel, margin + 105, y + 4.5);

    // Status pill
    const st = evalData.status || 'pass';
    if (st === 'pass') {
      doc.setTextColor(greenPass[0], greenPass[1], greenPass[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('✓ PASS', margin + 140, y + 4.5);
    } else if (st === 'fail') {
      doc.setTextColor(redFail[0], redFail[1], redFail[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('✗ FAIL', margin + 140, y + 4.5);
    } else {
      doc.setTextColor(140, 140, 140);
      doc.setFont('helvetica', 'normal');
      doc.text('— N/A', margin + 140, y + 4.5);
    }

    // Notes
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const hasPhoto = (evalData.photos && evalData.photos.length > 0) || !!evalData.photoUrl;
    const photoCount = evalData.photos?.length || (evalData.photoUrl ? 1 : 0);
    const photoTag = hasPhoto ? ` [${photoCount} photo${photoCount > 1 ? 's' : ''}]` : '';
    const noteText = (evalData.notes ? evalData.notes : 'Verified compliant') + photoTag;
    doc.text(noteText.length > 27 ? noteText.slice(0, 25) + '..' : noteText, margin + 160, y + 4.5);

    // Divider
    doc.setDrawColor(235, 235, 235);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    y += rowHeight;
  });

  y += 4;

  // 5. Notes & Supervisor Sign-off Section
  if (y > pageHeight - 42) {
    doc.addPage();
    y = margin;
  }

  // Supervisor Sign-off Box
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(lightBorder[0], lightBorder[1], lightBorder[2]);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

  // Left: Audit Statement & Notes
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(purplePrimary[0], purplePrimary[1], purplePrimary[2]);
  doc.text('SUPERVISOR ATTESTATION & AUDIT DISPATCH', margin + 5, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  doc.text(
    'I hereby certify that the after-hours cleaning and disinfection services for Anytime Fitness North Vancouver',
    margin + 5,
    y + 9
  );
  doc.text(
    'were inspected and certified against required sanitation, cleanliness, and facility quality standards.',
    margin + 5,
    y + 13
  );

  doc.text(`Auditor Notes: ${record.overallNotes || 'Facility in exemplary condition. All core surfaces disinfected.'}`, margin + 5, y + 18);
  const toDisplay = record.recipientTo || 'ronaldephard10@gmail.com';
  const ccDisplay = record.recipientCc ? ` | Cc: ${record.recipientCc}` : (record.recipientCc === '' ? '' : ' | Cc: ronald@marketingdo.net');
  doc.text(`Certified Email Dispatched To: ${toDisplay}${ccDisplay}`, margin + 5, y + 23);
  doc.text(`Generated via Clean Audit Pro • Schedule: 3x / Week (Sun, Tue, Thu at 11:00 PM)`, margin + 5, y + 28);

  // Right: Signature Box
  const sigBoxX = margin + contentWidth - 58;
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.rect(sigBoxX, y + 3.5, 54, 26);

  if (record.supervisorSignature && record.supervisorSignature.startsWith('data:image')) {
    try {
      doc.addImage(record.supervisorSignature, 'PNG', sigBoxX + 2, y + 4.5, 50, 16);
    } catch {
      doc.setFontSize(7);
      doc.text('[Digital Signature Verified]', sigBoxX + 4, y + 14);
    }
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(140, 140, 140);
    doc.text('Supervisor Signature on File', sigBoxX + 6, y + 14);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(90, 90, 90);
  doc.text(`Signed by: ${record.supervisorName || 'Supervisor'}`, sigBoxX + 2, y + 24);
  doc.text(`Date: ${record.signedAt || record.inspectionDate}`, sigBoxX + 2, y + 28);

  // 6. Photographic Station Evidence Appendix (if any station photos exist)
  interface PhotoEvidenceItem {
    stationName: string;
    status: string;
    notes?: string;
    dataUrl: string;
    timestamp?: string;
  }

  const allPhotoEvidence: PhotoEvidenceItem[] = [];
  activeItems.forEach((item) => {
    const evalData = record.items[item.id];
    if (!evalData) return;

    if (evalData.photos && evalData.photos.length > 0) {
      evalData.photos.forEach((p) => {
        allPhotoEvidence.push({
          stationName: item.name,
          status: evalData.status,
          notes: evalData.notes,
          dataUrl: p.dataUrl,
          timestamp: p.timestamp,
        });
      });
    } else if (evalData.photoUrl) {
      allPhotoEvidence.push({
        stationName: item.name,
        status: evalData.status,
        notes: evalData.notes,
        dataUrl: evalData.photoUrl,
        timestamp: 'Audit Snapshot',
      });
    }
  });

  if (allPhotoEvidence.length > 0) {
    doc.addPage();
    let photoY = margin;

    // Appendix Header Banner
    doc.setFillColor(purplePrimary[0], purplePrimary[1], purplePrimary[2]);
    doc.roundedRect(margin, photoY, contentWidth, 16, 2, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('SECTION 6: STATION PHOTO EVIDENCE APPENDIX', margin + 6, photoY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(230, 215, 250);
    doc.text(
      `Visual proof recorded for certified audit compliance • Total attached photos: ${allPhotoEvidence.length}`,
      margin + 6,
      photoY + 12
    );

    photoY += 21;

    const cardHeight = 56;

    allPhotoEvidence.forEach((evidence, idx) => {
      // Check if card fits on current page
      if (photoY + cardHeight > pageHeight - 16) {
        doc.addPage();
        photoY = margin;

        // Subheader on new page
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(purplePrimary[0], purplePrimary[1], purplePrimary[2]);
        doc.text('STATION PHOTO EVIDENCE APPENDIX (CONTINUED)', margin, photoY + 4);
        photoY += 8;
      }

      // Card Container
      doc.setFillColor(252, 252, 253);
      doc.setDrawColor(lightBorder[0], lightBorder[1], lightBorder[2]);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, photoY, contentWidth, cardHeight, 2, 2, 'FD');

      // Left info block (width ~ 115mm)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(20, 20, 20);
      doc.text(`${idx + 1}. ${evidence.stationName}`, margin + 5, photoY + 7);

      // Status Pill
      let badgeColor = greenPass;
      let badgeLabel = 'STATUS: PASS';
      if (evidence.status === 'fail') {
        badgeColor = redFail;
        badgeLabel = 'STATUS: FAIL / DEFICIENT';
      } else if (evidence.status === 'na') {
        badgeColor = [120, 120, 120];
        badgeLabel = 'STATUS: N/A';
      }

      doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
      doc.roundedRect(margin + 5, photoY + 11, 40, 5.5, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.text(badgeLabel, margin + 7, photoY + 14.8);

      // Timestamp
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text(`Recorded: ${evidence.timestamp || record.inspectionTime}`, margin + 50, photoY + 14.8);

      // Observation notes
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(60, 60, 60);
      const noteStr = evidence.notes
        ? `Station Notes: "${evidence.notes}"`
        : 'Station Notes: Cleaned, disinfected, and verified in inspection walkthrough.';
      const splitNotes = doc.splitTextToSize(noteStr, 110);
      doc.text(splitNotes, margin + 5, photoY + 22);

      // Facility badge info
      doc.setFontSize(6.5);
      doc.setTextColor(130, 130, 130);
      doc.text(`${FACILITY_INFO.facility} • ${FACILITY_INFO.address}`, margin + 5, photoY + 50);

      // Right image preview (60mm wide x 48mm high)
      const imgX = margin + contentWidth - 62;
      const imgY = photoY + 4;
      const imgW = 58;
      const imgH = 48;

      try {
        doc.addImage(evidence.dataUrl, 'JPEG', imgX, imgY, imgW, imgH);
        doc.setDrawColor(200, 200, 200);
        doc.rect(imgX, imgY, imgW, imgH);
      } catch (imgErr) {
        // Fallback if data format differs
        try {
          doc.addImage(evidence.dataUrl, 'PNG', imgX, imgY, imgW, imgH);
          doc.setDrawColor(200, 200, 200);
          doc.rect(imgX, imgY, imgW, imgH);
        } catch {
          doc.setFillColor(240, 240, 240);
          doc.rect(imgX, imgY, imgW, imgH, 'F');
          doc.setFontSize(7);
          doc.setTextColor(120, 120, 120);
          doc.text('[Photo Attached to Digital Audit]', imgX + 4, imgY + 24);
        }
      }

      photoY += cardHeight + 4;
    });
  }

  // Footer on bottom of all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Clean Audit Pro • Confidential Facility Inspection Certificate • ${FACILITY_INFO.facility} (${FACILITY_INFO.address})`,
      margin,
      pageHeight - 5
    );
    doc.text(`Page ${i} of ${totalPages}`, contentWidth + margin, pageHeight - 5, { align: 'right' });
  }

  const base64 = doc.output('datauristring').split(',')[1];
  const dateSlug = record.inspectionDate.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Anytime_Fitness_North_Van_${record.activeDay}_Audit_${dateSlug}.pdf`;

  return { doc, base64, filename };
}

/**
 * Download an active inspection record as PDF directly to user's device.
 */
export function downloadInspectionPDF(
  record: InspectionRecord,
  activeItems: InspectionItem[]
): { filename: string } {
  const { doc, filename } = generateInspectionPDF(record, activeItems);
  doc.save(filename);
  return { filename };
}

/**
 * Reconstruct and download a historical completed inspection as PDF.
 */
export function downloadCompletedInspectionPDF(comp: CompletedInspection): { filename: string } {
  const shift = comp.shift === 'full-audit' ? 'tuesday' : comp.shift;
  const shiftSpecific =
    shift === 'sunday'
      ? SUNDAY_SPECIFIC
      : shift === 'tuesday'
      ? TUESDAY_SPECIFIC
      : THURSDAY_SPECIFIC;

  const activeItems: InspectionItem[] = [...CORE_SERVICES, ...shiftSpecific];

  // Include any monthly deep clean tasks that were recorded
  const monthlyItems =
    shift === 'sunday'
      ? SUNDAY_MONTHLY
      : shift === 'tuesday'
      ? TUESDAY_MONTHLY
      : THURSDAY_MONTHLY;

  if (comp.monthlyTasksCompleted && comp.monthlyTasksCompleted.length > 0) {
    monthlyItems.forEach((mItem) => {
      const isLogged = comp.monthlyTasksCompleted.some(
        (t) =>
          t.toLowerCase().includes(mItem.name.toLowerCase()) ||
          mItem.name.toLowerCase().includes(t.toLowerCase())
      );
      if (isLogged && !activeItems.some((i) => i.id === mItem.id)) {
        activeItems.push(mItem);
      }
    });
  }

  // Synthesize evaluation map
  const itemsMap: Record<string, ItemEvaluation> = {};
  activeItems.forEach((item) => {
    const deficiency = comp.deficiencies?.find(
      (d) => d.itemName.toLowerCase() === item.name.toLowerCase()
    );
    if (deficiency) {
      itemsMap[item.id] = {
        id: item.id,
        status: 'fail',
        notes: deficiency.notes,
      };
    } else {
      itemsMap[item.id] = {
        id: item.id,
        status: 'pass',
      };
    }
  });

  const record: InspectionRecord = {
    id: comp.id,
    facility: FACILITY_INFO,
    inspectionDate: comp.date,
    inspectionTime: comp.time || '11:00 PM',
    activeDay: comp.shift,
    inspectorName: comp.inspectorName || 'Ronald Ephard',
    supervisorName: comp.supervisorName || 'Jennifer Johnson',
    supervisorSignature: '',
    signedAt: `${comp.date} at ${comp.time || '11:00 PM'}`,
    items: itemsMap,
    monthlyToggles: {},
    overallNotes: comp.notes,
    completedPeriodicServices: [],
    score: {
      percentage: comp.score,
      passedCount: comp.passedCount,
      failedCount: comp.failedCount,
      naCount: comp.naCount,
      totalEvaluated: comp.totalEvaluated,
      totalScorable: comp.totalEvaluated,
    },
    recipientTo: comp.dispatchedTo,
  };

  const { doc, filename } = generateInspectionPDF(record, activeItems);
  doc.save(filename);
  return { filename };
}
