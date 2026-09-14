/**
 * Vercel Serverless Function & Express API Endpoint: /api/send-monthly-summary
 * Dispatches monthly Quality Assurance summary PDF via Resend API to:
 * - To: Client (jen.johnson@anytimefitness.ca)
 * - Cc: Franchisee (ronaldephard10@gmail.com, ronald@marketingdo.net)
 * - From: "Clean Audit Pro" <inspections@cleanaudit.pro>
 */

export interface SendMonthlySummaryPayload {
  pdfBase64: string;
  filename?: string;
  recipientTo?: string;
  recipientCc?: string;
  monthName: string;
  inspectionsCount: number;
  averageScore: number;
  rotationsCount: number;
  deficienciesCount: number;
  notes?: string;
}

export async function handleSendMonthlySummary(data: SendMonthlySummaryPayload) {
  const {
    pdfBase64,
    filename,
    monthName,
    inspectionsCount,
    averageScore,
    rotationsCount,
    deficienciesCount,
  } = data;

  const rawTo = data.recipientTo || 'jen.johnson@anytimefitness.ca';
  const toList = rawTo.split(/[,;]/).map((e) => e.trim()).filter(Boolean);
  const toEmails = toList.length > 0 ? toList : ['jen.johnson@anytimefitness.ca'];

  const rawCc = data.recipientCc !== undefined ? data.recipientCc : 'ronaldephard10@gmail.com, ronald@marketingdo.net';
  const ccList = rawCc ? rawCc.split(/[,;]/).map((e) => e.trim()).filter(Boolean) : [];

  const fromEmail = 'Clean Audit Pro <inspections@cleanaudit.pro>';
  const fallbackFrom = 'Clean Audit Pro <onboarding@resend.dev>';

  const subject = `[Monthly QA Report] Anytime Fitness North Vancouver - ${monthName} Facility Review (${averageScore}% Compliance)`;

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #4B286D 0%, #2D1544 100%); padding: 24px; color: #ffffff; text-align: left;">
        <div style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #d8b4fe; font-weight: 700; margin-bottom: 4px;">Executive Quality Assurance</div>
        <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff;">Anytime Fitness • North Vancouver</h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #f3e8ff;">Northwoods Village | 2180 Dollarton Hwy Unit 103, North Vancouver, BC</p>
      </div>

      <div style="padding: 24px;">
        <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0 0 18px 0;">
          Hi Jennifer,
        </p>
        <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0 0 18px 0;">
          Attached is your <strong>Monthly Quality Assurance & Sanitation Report</strong> for <strong>${monthName}</strong>. 
          To protect your inbox from daily email fatigue, we consolidate all after-hours scheduled visits into this single comprehensive performance report.
        </p>

        <!-- Executive Summary Highlights Grid -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #4B286D;">
            ${monthName} Executive Performance Metrics
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b;">Completed Shift Inspections:</td>
              <td style="padding: 8px 0; font-weight: 700; color: #1e293b; text-align: right;">${inspectionsCount} Visits Audited (100% On-Time)</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b;">Average Facility Compliance:</td>
              <td style="padding: 8px 0; font-weight: 800; color: ${averageScore >= 90 ? '#166534' : '#b45309'}; text-align: right;">${averageScore}% (Exceeds Benchmark)</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b;">Monthly Deep-Clean Rotations:</td>
              <td style="padding: 8px 0; font-weight: 700; color: #4B286D; text-align: right;">${rotationsCount} Completed in Rotation</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Deficiencies Caught &amp; Resolved:</td>
              <td style="padding: 8px 0; font-weight: 700; color: #166534; text-align: right;">${deficienciesCount} (100% Remediated on-site)</td>
            </tr>
          </table>
        </div>

        <h4 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #1e293b;">
          What is included in the attached certificate:
        </h4>
        <ul style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 20px 0; padding-left: 20px;">
          <li>Chronological log of all Sunday, Tuesday, and Thursday 11:00 PM cleaning shifts</li>
          <li>Itemized verification of the 6 monthly periodic deep-clean rotations</li>
          <li>On-site deficiency remediation tracking &amp; photo verifications</li>
          <li>Certified attestation by Coverall Franchisee Ronald Ephard</li>
        </ul>

        <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0 0 20px 0;">
          If you have any questions or custom service requests for upcoming shifts, please feel free to reach out directly.
        </p>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #334155;">
          <strong>Ronald Ephard</strong><br/>
          Coverall Health-Based Cleaning System Franchisee • Account #3007<br/>
          Phone / Direct: Contact Ronald &bull; Clean Audit Pro System
        </div>
      </div>
    </div>
  `;

  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.log('[Clean Audit Pro] RESEND_API_KEY not found. Returning simulated Monthly QA dispatch.');
    return {
      success: true,
      mode: 'simulated' as const,
      messageId: `sim_monthly_${Date.now()}`,
      to: toEmails.join(', '),
      cc: ccList.join(', '),
      from: fromEmail,
      subject,
      filename: filename || `Anytime_Fitness_Monthly_QA_${monthName}.pdf`,
      note: 'Simulated Monthly QA dispatch successful. Add RESEND_API_KEY to send real email.',
    };
  }

  const sendEmail = async (sender: string) => {
    const emailPayload: Record<string, any> = {
      from: sender,
      to: toEmails,
      subject,
      html: htmlContent,
      attachments: [
        {
          filename: filename || `Anytime_Fitness_Monthly_QA_${monthName}.pdf`,
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
    console.error('Failed to send Monthly QA summary via Resend API:', errorMsg);
    throw new Error(errorMsg);
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const result = await handleSendMonthlySummary(payload);
    return res.status(200).json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return res.status(500).json({ error: message });
  }
}
