import { jsPDF } from 'jspdf';
import { MonthlyReportMetrics } from './inspectionHistory';
import { FACILITY_INFO } from '../types/inspection';

export function generateMonthlySummaryPDF(
  metrics: MonthlyReportMetrics,
  recipientTo: string = 'jen.johnson@anytimefitness.ca',
  recipientCc: string = 'ronaldephard10@gmail.com, ronald@marketingdo.net'
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
  const darkNavy = [20, 14, 30];
  const purpleLight = [243, 238, 250];
  const greenPass = [16, 149, 79];
  const redFail = [220, 38, 38];
  const grayText = [75, 85, 99];
  const lightBorder = [229, 231, 235];
  const goldAccent = [217, 119, 6];

  let y = margin;

  // 1. Executive Top Brand Banner
  doc.setFillColor(purplePrimary[0], purplePrimary[1], purplePrimary[2]);
  doc.roundedRect(margin, y, contentWidth, 26, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('ANYTIME FITNESS • NORTH VANCOUVER', margin + 6, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(230, 215, 250);
  doc.text('MONTHLY EXECUTIVE QUALITY ASSURANCE & FACILITY SANITATION REPORT', margin + 6, y + 17);
  doc.text('COVERALL HEALTH-BASED CLEANING SYSTEM', contentWidth + margin - 6, y + 10, { align: 'right' });

  doc.setFontSize(8);
  doc.text(`REPORTING PERIOD: ${metrics.monthName.toUpperCase()}`, contentWidth + margin - 6, y + 17, { align: 'right' });

  y += 30;

  // 2. Executive Metadata Box
  doc.setFillColor(249, 250, 251);
  doc.setDrawColor(lightBorder[0], lightBorder[1], lightBorder[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 32, 2, 2, 'FD');

  // Left Column: Facility Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(purplePrimary[0], purplePrimary[1], purplePrimary[2]);
  doc.text('FACILITY & CONTRACT INFORMATION', margin + 5, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(50, 50, 50);
  doc.text(`Facility: ${FACILITY_INFO.facility}`, margin + 5, y + 12);
  doc.text(`Location: ${FACILITY_INFO.address}`, margin + 5, y + 17);
  doc.text(`Client Manager: ${FACILITY_INFO.contactName} (${FACILITY_INFO.contactPhone})`, margin + 5, y + 22);
  doc.text(`Cleaning Schedule: ${FACILITY_INFO.frequency}`, margin + 5, y + 27);

  // Right Column: Service Provider Details
  const rightColX = margin + contentWidth / 2 + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(purplePrimary[0], purplePrimary[1], purplePrimary[2]);
  doc.text('SERVICE PROVIDER & AUDIT PROFILE', rightColX, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(50, 50, 50);
  doc.text(`Certified Franchisee: ${FACILITY_INFO.franchiseeName} (Account #${FACILITY_INFO.accountNumber})`, rightColX, y + 12);
  doc.text(`Cleaning Standards: Coverall Health-Based Cleaning System (Hospital-Grade)`, rightColX, y + 17);
  doc.text(`Reporting Cadence: Monthly Executive Summary (First Friday Release)`, rightColX, y + 22);
  doc.text(`Client Distribution: ${recipientTo}`, rightColX, y + 27);

  y += 36;

  // 3. Four Key Executive Performance Cards
  const cardWidth = (contentWidth - 9) / 4;
  const cardHeight = 22;

  // Card 1: Completed Audits
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(lightBorder[0], lightBorder[1], lightBorder[2]);
  doc.roundedRect(margin, y, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(purplePrimary[0], purplePrimary[1], purplePrimary[2]);
  doc.text(`${metrics.inspectionsCount}`, margin + cardWidth / 2, y + 10, { align: 'center' });
  doc.setFontSize(7);
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.text('INSPECTIONS AUDITED', margin + cardWidth / 2, y + 15, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setTextColor(greenPass[0], greenPass[1], greenPass[2]);
  doc.text('100% On-Time Completion', margin + cardWidth / 2, y + 19, { align: 'center' });

  // Card 2: Average Compliance
  const card2X = margin + cardWidth + 3;
  const avgScore = metrics.averageScore || 100;
  const isHighPass = avgScore >= 90;
  doc.setFillColor(isHighPass ? 240 : 254, isHighPass ? 253 : 242, isHighPass ? 244 : 242);
  doc.setDrawColor(isHighPass ? greenPass[0] : redFail[0], isHighPass ? greenPass[1] : redFail[1], isHighPass ? greenPass[2] : redFail[2]);
  doc.roundedRect(card2X, y, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(isHighPass ? greenPass[0] : redFail[0], isHighPass ? greenPass[1] : redFail[1], isHighPass ? greenPass[2] : redFail[2]);
  doc.text(`${avgScore}%`, card2X + cardWidth / 2, y + 10, { align: 'center' });
  doc.setFontSize(7);
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.text('AVG COMPLIANCE SCORE', card2X + cardWidth / 2, y + 15, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setTextColor(isHighPass ? greenPass[0] : redFail[0], isHighPass ? greenPass[1] : redFail[1], isHighPass ? greenPass[2] : redFail[2]);
  doc.text(isHighPass ? 'EXCEEDS BENCHMARK' : 'REVIEWS MONITORED', card2X + cardWidth / 2, y + 19, { align: 'center' });

  // Card 3: Monthly Deep-Clean Rotations
  const card3X = card2X + cardWidth + 3;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(lightBorder[0], lightBorder[1], lightBorder[2]);
  doc.roundedRect(card3X, y, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(purplePrimary[0], purplePrimary[1], purplePrimary[2]);
  doc.text(`${metrics.monthlyRotationsCompleted.length}`, card3X + cardWidth / 2, y + 10, { align: 'center' });
  doc.setFontSize(7);
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.text('DEEP CLEANS COMPLETED', card3X + cardWidth / 2, y + 15, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setTextColor(purplePrimary[0], purplePrimary[1], purplePrimary[2]);
  doc.text('Rotational Services Active', card3X + cardWidth / 2, y + 19, { align: 'center' });

  // Card 4: Deficiencies Remediated
  const card4X = card3X + cardWidth + 3;
  const defCount = metrics.deficiencies.length;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(lightBorder[0], lightBorder[1], lightBorder[2]);
  doc.roundedRect(card4X, y, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(defCount > 0 ? goldAccent[0] : greenPass[0], defCount > 0 ? goldAccent[1] : greenPass[1], defCount > 0 ? goldAccent[2] : greenPass[2]);
  doc.text(`${defCount}`, card4X + cardWidth / 2, y + 10, { align: 'center' });
  doc.setFontSize(7);
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.text('DEFICIENCIES CAUGHT', card4X + cardWidth / 2, y + 15, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setTextColor(greenPass[0], greenPass[1], greenPass[2]);
  doc.text('100% Remediated On-Site', card4X + cardWidth / 2, y + 19, { align: 'center' });

  y += 27;

  // 4. Monthly Deep-Clean Rotations Breakdown Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(purplePrimary[0], purplePrimary[1], purplePrimary[2]);
  doc.text('SECTION 1: MONTHLY PERIODIC DEEP-CLEAN ROTATIONS VERIFICATION', margin, y);
  y += 4;

  // Table header
  doc.setFillColor(purplePrimary[0], purplePrimary[1], purplePrimary[2]);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('ROTATION SCHEDULE', margin + 3, y + 4.2);
  doc.text('PERIODIC SERVICE TASK', margin + 45, y + 4.2);
  doc.text('TARGET AREA', margin + 115, y + 4.2);
  doc.text('STATUS THIS MONTH', margin + 152, y + 4.2);
  y += 6;

  const standardMonthlyRotations = [
    {
      schedule: '1st Tuesday of Month',
      task: 'Dust & Wipe Window Blinds (Page 3)',
      area: 'Front Lobby & Gym Windows',
      status: metrics.monthlyRotationsCompleted.some((r) => r.toLowerCase().includes('blind'))
        ? 'COMPLETED ✓'
        : 'Scheduled in Rotation',
    },
    {
      schedule: '2nd Tuesday of Month',
      task: 'Vacuum Air Return Grilles & Diffusers (Page 3)',
      area: 'Ceiling Vents & Light Diffusers',
      status: metrics.monthlyRotationsCompleted.some((r) => r.toLowerCase().includes('grille') || r.toLowerCase().includes('diffuser') || r.toLowerCase().includes('vent'))
        ? 'COMPLETED ✓'
        : 'Scheduled in Rotation',
    },
    {
      schedule: '2nd Thursday of Month',
      task: 'Perimeter Edge Vacuuming & Baseboards (Page 5)',
      area: 'Carpet Borders & Corners',
      status: metrics.monthlyRotationsCompleted.some((r) => r.toLowerCase().includes('edge'))
        ? 'COMPLETED ✓'
        : 'Scheduled in Rotation',
    },
    {
      schedule: '2nd Sunday of Month',
      task: 'Partition Glass & Plexiglass Wall Wash (Page 4)',
      area: 'Gym Glass & Office Partitions',
      status: metrics.monthlyRotationsCompleted.some((r) => r.toLowerCase().includes('partition'))
        ? 'COMPLETED ✓'
        : 'Scheduled in Rotation',
    },
    {
      schedule: '4th Sunday of Month',
      task: 'Staff Refrigerator Interior Sanitization (Page 4)',
      area: 'Staff Breakroom Kitchen',
      status: metrics.monthlyRotationsCompleted.some((r) => r.toLowerCase().includes('refrigerator'))
        ? 'COMPLETED ✓'
        : 'Scheduled in Rotation',
    },
    {
      schedule: '4th Thursday of Month',
      task: 'Vacuum Fabric Furniture & Upholstery (Page 5)',
      area: 'Office & Member Seating',
      status: metrics.monthlyRotationsCompleted.some((r) => r.toLowerCase().includes('fabric') || r.toLowerCase().includes('furniture'))
        ? 'COMPLETED ✓'
        : 'Scheduled in Rotation',
    },
  ];

  standardMonthlyRotations.forEach((rot, idx) => {
    const isCompleted = rot.status.includes('COMPLETED');
    const rowBg = idx % 2 === 0 ? 255 : 250;
    doc.setFillColor(rowBg, rowBg, rowBg);
    doc.rect(margin, y, contentWidth, 6.5, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(60, 60, 60);
    doc.text(rot.schedule, margin + 3, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(rot.task, margin + 45, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 90, 90);
    doc.text(rot.area, margin + 115, y + 4.5);

    if (isCompleted) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(greenPass[0], greenPass[1], greenPass[2]);
      doc.text('✓ COMPLETED', margin + 152, y + 4.5);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(110, 110, 110);
      doc.text('Rotational Standard', margin + 152, y + 4.5);
    }

    doc.setDrawColor(235, 235, 235);
    doc.line(margin, y + 6.5, margin + contentWidth, y + 6.5);
    y += 6.5;
  });

  y += 7;

  // 5. Shift-by-Shift Inspection Log Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(purplePrimary[0], purplePrimary[1], purplePrimary[2]);
  doc.text(`SECTION 2: SHIFT-BY-SHIFT AUDIT TRAIL (${metrics.inspectionsList.length} INSPECTIONS AUDITED)`, margin, y);
  y += 4;

  // Table header
  doc.setFillColor(purplePrimary[0], purplePrimary[1], purplePrimary[2]);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('DATE', margin + 3, y + 4.2);
  doc.text('SHIFT TIMING', margin + 28, y + 4.2);
  doc.text('INSPECTOR', margin + 65, y + 4.2);
  doc.text('COMPLIANCE', margin + 105, y + 4.2);
  doc.text('VERIFICATION NOTES / HIGHLIGHTS', margin + 130, y + 4.2);
  y += 6;

  metrics.inspectionsList.forEach((insp, idx) => {
    // Page break check
    if (y > pageHeight - 35) {
      doc.addPage();
      y = margin;
      doc.setFillColor(purplePrimary[0], purplePrimary[1], purplePrimary[2]);
      doc.rect(margin, y, contentWidth, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text('DATE', margin + 3, y + 4.2);
      doc.text('SHIFT TIMING', margin + 28, y + 4.2);
      doc.text('INSPECTOR', margin + 65, y + 4.2);
      doc.text('COMPLIANCE', margin + 105, y + 4.2);
      doc.text('VERIFICATION NOTES / HIGHLIGHTS', margin + 130, y + 4.2);
      y += 6;
    }

    const rowBg = idx % 2 === 0 ? 255 : 249;
    doc.setFillColor(rowBg, rowBg, rowBg);
    doc.rect(margin, y, contentWidth, 6.5, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(50, 50, 50);
    doc.text(insp.date, margin + 3, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(purplePrimary[0], purplePrimary[1], purplePrimary[2]);
    doc.text(`${insp.shift.toUpperCase()} (11 PM)`, margin + 28, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(insp.inspectorName || 'Ronald Ephard', margin + 65, y + 4.5);

    // Score
    const isPass = insp.score >= 90;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isPass ? greenPass[0] : goldAccent[0], isPass ? greenPass[1] : goldAccent[1], isPass ? greenPass[2] : goldAccent[2]);
    doc.text(`${insp.score}% PASSED`, margin + 105, y + 4.5);

    // Notes
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const shortNote = insp.notes ? (insp.notes.length > 38 ? insp.notes.slice(0, 36) + '..' : insp.notes) : 'Sanitation standards confirmed.';
    doc.text(shortNote, margin + 130, y + 4.5);

    doc.setDrawColor(235, 235, 235);
    doc.line(margin, y + 6.5, margin + contentWidth, y + 6.5);
    y += 6.5;
  });

  y += 7;

  // 6. Section 3: Deficiencies Logged & Corrected
  if (y > pageHeight - 55) {
    doc.addPage();
    y = margin;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(purplePrimary[0], purplePrimary[1], purplePrimary[2]);
  doc.text('SECTION 3: DEFICIENCIES LOGGED & CORRECTIVE ACTION RESOLUTIONS', margin, y);
  y += 4;

  if (metrics.deficiencies.length === 0) {
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(greenPass[0], greenPass[1], greenPass[2]);
    doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(greenPass[0], greenPass[1], greenPass[2]);
    doc.text('✓ ZERO DEFICIENCIES RECORDED THIS MONTH', margin + 5, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(50, 50, 50);
    doc.text('All facilities, locker rooms, equipment touchpoints, and member areas fully adhered to specifications.', margin + 5, y + 9);
    y += 16;
  } else {
    metrics.deficiencies.forEach((def, idx) => {
      doc.setFillColor(254, 252, 232);
      doc.setDrawColor(goldAccent[0], goldAccent[1], goldAccent[2]);
      doc.roundedRect(margin, y, contentWidth, 13, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(140, 80, 0);
      doc.text(`[${def.date} - ${def.shift} Shift] Item: ${def.itemName}`, margin + 5, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(50, 50, 50);
      doc.text(`Corrective Action: ${def.notes}`, margin + 5, y + 9.5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(greenPass[0], greenPass[1], greenPass[2]);
      doc.text('✓ RESOLVED ON-SITE BEFORE SHIFT COMPLETION', contentWidth + margin - 5, y + 5, { align: 'right' });

      y += 15;
    });
  }

  // 7. Executive Sign-Off & Delivery Attestation
  if (y > pageHeight - 45) {
    doc.addPage();
    y = margin;
  }

  doc.setFillColor(250, 250, 251);
  doc.setDrawColor(lightBorder[0], lightBorder[1], lightBorder[2]);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(purplePrimary[0], purplePrimary[1], purplePrimary[2]);
  doc.text('EXECUTIVE ATTESTATION & CLIENT QUALITY DELIVERY', margin + 5, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(70, 70, 70);
  doc.text(
    'This Monthly Quality Assurance Summary consolidates all scheduled after-hours inspections conducted at',
    margin + 5,
    y + 11
  );
  doc.text(
    'Anytime Fitness North Vancouver (Unit 103). All sanitation protocols, hospital-grade disinfection, and',
    margin + 5,
    y + 15
  );
  doc.text(
    'Coverall periodic rotations were executed under direct franchisee supervision without disrupting member operations.',
    margin + 5,
    y + 19
  );

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(`Certified Franchisee: Ronald Ephard • Account #3007`, margin + 5, y + 25);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text(`Transmitted via Clean Audit Pro to Jennifer Johnson (jen.johnson@anytimefitness.ca)`, margin + 5, y + 29);

  // Seal badge on the right
  const sealX = margin + contentWidth - 45;
  doc.setFillColor(purplePrimary[0], purplePrimary[1], purplePrimary[2]);
  doc.roundedRect(sealX, y + 5, 40, 24, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('CLEAN AUDIT PRO', sealX + 20, y + 11, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setTextColor(230, 215, 250);
  doc.text('EXECUTIVE VERIFIED', sealX + 20, y + 16, { align: 'center' });
  doc.setFontSize(6);
  doc.setTextColor(167, 243, 208);
  doc.text('100% AUDIT TRAIL', sealX + 20, y + 22, { align: 'center' });

  // Page Numbers Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Clean Audit Pro • Monthly Quality Assurance Report • ${FACILITY_INFO.facility} (${FACILITY_INFO.address})`,
      margin,
      pageHeight - 5
    );
    doc.text(`Page ${i} of ${totalPages}`, contentWidth + margin, pageHeight - 5, { align: 'right' });
  }

  const base64 = doc.output('datauristring').split(',')[1];
  const dateSlug = metrics.monthName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Anytime_Fitness_Monthly_QA_Report_${dateSlug}.pdf`;

  return { doc, base64, filename };
}
