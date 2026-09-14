/**
 * Vercel Serverless Function & Express API Endpoint: /api/send-inspection
 * Dispatches certified inspection PDF via Resend API to:
 * - To: ronaldephard10@gmail.com
 * - Cc: ronald@marketingdo.net
 * - From: "Clean Audit Pro" <inspections@cleanaudit.pro>
 */

export interface SendInspectionPayload {
  pdfBase64: string;
  filename?: string;
  recipientTo?: string;
  recipientCc?: string;
  record: {
    id: string;
    activeDay: string;
    inspectionDate: string;
    inspectionTime: string;
    inspectorName?: string;
    supervisorName?: string;
    score: {
      percentage: number;
      passedCount: number;
      failedCount: number;
      naCount: number;
      totalScorable: number;
    };
    overallNotes?: string;
    photoCount?: number;
    recipientTo?: string;
    recipientCc?: string;
  };
}

export async function handleSendInspection(data: SendInspectionPayload) {
  const { pdfBase64, filename, record } = data;

  const rawTo = data.recipientTo || record.recipientTo || 'ronaldephard10@gmail.com';
  const toList = rawTo.split(/[,;]/).map((e) => e.trim()).filter(Boolean);
  const toEmails = toList.length > 0 ? toList : ['ronaldephard10@gmail.com'];

  const rawCc =
    data.recipientCc !== undefined
      ? data.recipientCc
      : record.recipientCc !== undefined
      ? record.recipientCc
      : 'ronald@marketingdo.net';
  const ccList = rawCc ? rawCc.split(/[,;]/).map((e) => e.trim()).filter(Boolean) : [];

  const fromEmail = 'Clean Audit Pro <inspections@cleanaudit.pro>';
  const fallbackFrom = 'Clean Audit Pro <onboarding@resend.dev>';

  const subject = `[Certified Inspection] Anytime Fitness North Vancouver - ${record.activeDay.toUpperCase()} 11:00 PM Audit (${record.score.percentage}% Compliance)`;

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #4B286D 0%, #2D1544 100%); padding: 24px; color: #ffffff; text-align: left;">
        <div style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #d8b4fe; font-weight: 700; margin-bottom: 4px;">Official Audit Certificate</div>
        <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff;">Anytime Fitness • North Vancouver</h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #f3e8ff;">Northwoods Village | 2180 Dollarton Hwy Unit 103, North Vancouver, BC</p>
      </div>

      <div style="padding: 24px;">
        <div style="display: flex; background: ${record.score.percentage >= 85 ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${record.score.percentage >= 85 ? '#bbf7d0' : '#fecaca'}; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <div>
            <div style="font-size: 28px; font-weight: 800; color: ${record.score.percentage >= 85 ? '#166534' : '#991b1b'};">${record.score.percentage}%</div>
            <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #4b5563;">Compliance Rating (${record.activeDay.toUpperCase()} 11:00 PM Shift)</div>
          </div>
          <div style="margin-left: auto; text-align: right;">
            <span style="display: inline-block; background: ${record.score.percentage >= 85 ? '#16a34a' : '#dc2626'}; color: #ffffff; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700;">
              ${record.score.percentage >= 85 ? 'PASSED CERTIFICATION' : 'ACTION REQUIRED'}
            </span>
          </div>
        </div>

        <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #4B286D; margin: 0 0 12px 0;">Shift & Facility Verification</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b;">Schedule:</td>
            <td style="padding: 8px 0; font-weight: 600; color: #1e293b; text-align: right;">3x / Week (Sunday, Tuesday, Thursday at 11:00 PM)</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b;">Shift Audited:</td>
            <td style="padding: 8px 0; font-weight: 600; color: #4B286D; text-align: right;">${record.activeDay.toUpperCase()} Shift (11:00 PM)</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b;">Inspection Date/Time:</td>
            <td style="padding: 8px 0; font-weight: 600; color: #1e293b; text-align: right;">${record.inspectionDate} at ${record.inspectionTime}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b;">Inspector:</td>
            <td style="padding: 8px 0; font-weight: 600; color: #1e293b; text-align: right;">${record.inspectorName || 'Lead Sanitation Specialist'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b;">Supervisor Sign-off:</td>
            <td style="padding: 8px 0; font-weight: 600; color: #1e293b; text-align: right;">${record.supervisorName || 'Designated Shift Supervisor'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b;">Facility Contact:</td>
            <td style="padding: 8px 0; font-weight: 600; color: #1e293b; text-align: right;">Jennifer Johnson (604-785-4857)</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b;">Recipients:</td>
            <td style="padding: 8px 0; font-weight: 600; color: #1e293b; text-align: right;">${toEmails.join(', ')}${ccList.length > 0 ? ` (Cc: ${ccList.join(', ')})` : ''}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b;">Checklist Evaluation:</td>
            <td style="padding: 8px 0; font-weight: 600; color: #1e293b; text-align: right;">${record.score.passedCount} Passed / ${record.score.failedCount} Failed / ${record.score.naCount} N/A</td>
          </tr>
          ${
            record.photoCount && record.photoCount > 0
              ? `<tr>
                  <td style="padding: 8px 0; color: #64748b;">Station Visual Evidence:</td>
                  <td style="padding: 8px 0; font-weight: 700; color: #4B286D; text-align: right;">${record.photoCount} Certified Station Picture${record.photoCount > 1 ? 's' : ''} Attached in PDF</td>
                </tr>`
              : ''
          }
        </table>

        ${
          record.overallNotes
            ? `<div style="background: #f8fafc; border-left: 3px solid #4B286D; padding: 12px; margin-bottom: 20px; font-size: 13px; color: #334155;">
                <strong>Auditor Notes:</strong> ${record.overallNotes}
              </div>`
            : ''
        }

        <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0 0 16px 0;">
          The full, tamper-evident certified audit inspection report is attached to this email in PDF format, complete with supervisor signature and itemized task breakdown.
        </p>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center;">
          Clean Audit Pro System • Automated Facility Sanitation Verification<br/>
          Facility: Anytime Fitness North Vancouver (Northwoods Village)
        </div>
      </div>
    </div>
  `;

  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    // Graceful simulation mode when API key is not yet set in environment
    console.log('[Clean Audit Pro] RESEND_API_KEY not found. Returning verified simulated dispatch.');
    return {
      success: true,
      mode: 'simulated' as const,
      messageId: `sim_${Date.now()}`,
      to: toEmails.join(', '),
      cc: ccList.join(', '),
      from: fromEmail,
      subject,
      filename,
      note: 'Simulated dispatch successful. Provide RESEND_API_KEY in environment to route via live Resend API.',
    };
  }

  // Live dispatch via Resend API
  const sendEmail = async (sender: string) => {
    const emailPayload: Record<string, any> = {
      from: sender,
      to: toEmails,
      subject,
      html: htmlContent,
      attachments: [
        {
          filename: filename || 'Anytime_Fitness_Inspection.pdf',
          content: pdfBase64,
        },
      ],
    };

    if (ccList.length > 0) {
      emailPayload.cc = ccList;
    }

    return await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });
  };

  try {
    let response = await sendEmail(fromEmail);
    let resData = await response.json();

    // If custom domain is not verified yet, fallback to onboarding@resend.dev
    if (!response.ok && resData?.message?.includes('domain')) {
      console.warn('Primary sender domain not verified, falling back to Resend default sender');
      response = await sendEmail(fallbackFrom);
      resData = await response.json();
    }

    if (!response.ok) {
      throw new Error(resData?.message || 'Resend API returned an error');
    }

    return {
      success: true,
      mode: 'live' as const,
      messageId: resData.id,
      to: toEmails.join(', '),
      cc: ccList.join(', '),
      from: fromEmail,
      subject,
      filename,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown Resend error';
    console.error('Failed to send via Resend API:', errorMsg);
    throw new Error(errorMsg);
  }
}

// Default export for Vercel Serverless Function
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const result = await handleSendInspection(payload);
    return res.status(200).json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return res.status(500).json({ error: message });
  }
}
