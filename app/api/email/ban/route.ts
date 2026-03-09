import { NextRequest, NextResponse } from 'next/server';
import { transporter, emailWrapper } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, reason, banExpires } = await req.json();
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

    const expiryDate = banExpires
      ? new Date(banExpires).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : null;

    const html = emailWrapper(`
      <!-- Icon -->
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;background:#fef2f2;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;">
          🚫
        </div>
      </div>

      <h2 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827;text-align:center;">
        Your Account Has Been Suspended
      </h2>
      <p style="margin:0 0 24px;font-size:15px;color:#6b7280;text-align:center;">
        Hi ${firstName ?? 'there'}, your ReFuel Athletics account has been suspended.
      </p>

      <!-- Reason box -->
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#ef4444;">
          Reason
        </p>
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">
          ${reason ?? 'Violation of community guidelines.'}
        </p>
      </div>

      <!-- What happens next -->
      <div style="background:#f9fafb;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#111827;">What happens next</p>
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding:6px 0;vertical-align:top;width:24px;font-size:14px;">1.</td>
            <td style="padding:6px 0;font-size:13px;color:#374151;line-height:1.5;">
              You have <strong>2 weeks</strong>${expiryDate ? ` (until ${expiryDate})` : ''} to submit an unban request by replying to this email.
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;vertical-align:top;font-size:14px;">2.</td>
            <td style="padding:6px 0;font-size:13px;color:#374151;line-height:1.5;">
              We'll review your request and notify you of our decision.
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;vertical-align:top;font-size:14px;">3.</td>
            <td style="padding:6px 0;font-size:13px;color:#374151;line-height:1.5;">
              If no request is received or the request is not accepted, your account will be <strong>permanently deleted</strong>${expiryDate ? ` on ${expiryDate}` : ' after 2 weeks'}.
            </td>
          </tr>
        </table>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:8px;">
        <a href="mailto:haydenh.refuel@gmail.com?subject=Unban Request — ${encodeURIComponent(email)}&body=Hi, I would like to appeal my account suspension. My email is ${encodeURIComponent(email)}.%0A%0AMy reason for requesting an unban:%0A"
          style="display:inline-block;background:#111827;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:10px;">
          Submit Unban Request →
        </a>
      </div>
      <p style="margin:12px 0 0;font-size:12px;color:#9ca3af;text-align:center;">
        Or reply directly to this email with your appeal.
      </p>
    `);

    await transporter.sendMail({
      from:    `"ReFuel Athletics" <${process.env.GMAIL_USER}>`,
      to:      email,
      subject: 'Your ReFuel Athletics account has been suspended',
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Ban email error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
