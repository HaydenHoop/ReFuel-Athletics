import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email, firstName } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"ReFuel Athletics" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Your ReFuel account has been reinstated',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          </head>
          <body style="margin:0; padding:0; background:#f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5; padding: 40px 16px;">
              <tr>
                <td align="center">
                  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

                    <!-- Logo -->
                    <tr>
                      <td align="center" style="padding-bottom: 28px;">
                        <div style="display:inline-block; background:#000; border-radius:12px; padding: 10px 20px;">
                          <span style="color:#fff; font-size:18px; font-weight:900; letter-spacing:-0.5px;">ReFuel</span>
                          <span style="color:#666; font-size:11px; font-weight:600; letter-spacing:0.15em; text-transform:uppercase; display:block; margin-top:1px;">Athletics</span>
                        </div>
                      </td>
                    </tr>

                    <!-- Card -->
                    <tr>
                      <td style="background:#fff; border-radius:20px; overflow:hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.07);">

                        <!-- Green top bar -->
                        <div style="background: linear-gradient(90deg, #16a34a, #22c55e); height:5px;"></div>

                        <div style="padding: 40px 40px 36px;">

                          <!-- Icon -->
                          <div style="text-align:center; margin-bottom: 28px;">
                            <div style="display:inline-flex; align-items:center; justify-content:center; width:64px; height:64px; background:#f0fdf4; border-radius:50%; border: 2px solid #bbf7d0;">
                              <span style="font-size:28px;">✓</span>
                            </div>
                          </div>

                          <!-- Heading -->
                          <h1 style="margin:0 0 12px; font-size:22px; font-weight:800; color:#111827; text-align:center; letter-spacing:-0.3px;">
                            Account reinstated
                          </h1>

                          <!-- Body -->
                          <p style="margin:0 0 20px; font-size:15px; color:#6b7280; line-height:1.65; text-align:center;">
                            Hi${firstName ? ` ${firstName}` : ''}, your ReFuel Athletics account has been reinstated and you now have full access again.
                          </p>

                          <p style="margin:0 0 32px; font-size:14px; color:#9ca3af; line-height:1.65; text-align:center;">
                            You can sign back in at any time. If you have any questions, reply to this email and we'll get back to you.
                          </p>

                          <!-- CTA -->
                          <div style="text-align:center;">
                            <a href="https://refuelsports.com"
                              style="display:inline-block; background:#000; color:#fff; font-size:14px; font-weight:700; padding:13px 32px; border-radius:50px; text-decoration:none; letter-spacing:0.01em;">
                              Back to ReFuel →
                            </a>
                          </div>

                        </div>

                        <!-- Footer -->
                        <div style="border-top:1px solid #f3f4f6; padding:20px 40px; background:#fafafa;">
                          <p style="margin:0; font-size:12px; color:#9ca3af; text-align:center; line-height:1.6;">
                            ReFuel Athletics · Built for athletes who refuse to compromise.<br />
                            Questions? <a href="mailto:haydenh.refuel@gmail.com" style="color:#6b7280;">haydenh.refuel@gmail.com</a>
                          </p>
                        </div>

                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Unban email error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
