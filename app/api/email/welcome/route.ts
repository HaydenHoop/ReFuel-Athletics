import { NextRequest, NextResponse } from 'next/server';
import { transporter, emailWrapper } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Missing name or email' }, { status: 400 });
    }

    const firstName = name.split(' ')[0];

    const html = emailWrapper(`
      <!-- Hero -->
      <div style="text-align:center;margin-bottom:28px;">
        <div style="font-size:48px;margin-bottom:12px;">⚡</div>
        <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#111827;letter-spacing:-0.5px;">
          Welcome to ReFuel, ${firstName}.
        </h1>
        <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.6;">
          Your account is ready. Time to build the gel that's actually dialed in for you.
        </p>
      </div>

      <!-- Divider -->
      <div style="border-top:1px solid #f3f4f6;margin:24px 0;"></div>

      <!-- What you can do -->
      <p style="margin:0 0 16px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;">
        What's waiting for you
      </p>
      <table cellpadding="0" cellspacing="0" width="100%">
        ${[
          ['🎯', 'Find Your Gel', 'Take the 7-question diagnostic to get a formula built around your sport, sweat rate, and gut sensitivity.'],
          ['⚗️', 'Full Customization', 'Dial in carbs, fructose ratio, sodium, potassium, magnesium, caffeine, and consistency.'],
          ['🔖', 'Save Your Formulas', 'Save up to 10 custom formulas to your account and load them back in one click.'],
          ['🧴', 'Reusable Packets', 'Pair your gel with our reusable silicone packet — fill, race, rinse, repeat.'],
        ].map(([icon, title, desc]) => `
          <tr>
            <td style="padding:10px 0;vertical-align:top;width:36px;">
              <span style="font-size:20px;">${icon}</span>
            </td>
            <td style="padding:10px 0 10px 8px;vertical-align:top;">
              <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#111827;">${title}</p>
              <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">${desc}</p>
            </td>
          </tr>
        `).join('')}
      </table>

      <!-- Divider -->
      <div style="border-top:1px solid #f3f4f6;margin:24px 0;"></div>

      <!-- CTA -->
      <div style="text-align:center;">
        <a href="http://localhost:3000"
          style="display:inline-block;background:#000000;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:12px;letter-spacing:-0.2px;">
          Start Building Your Formula →
        </a>
        <p style="margin:14px 0 0;font-size:12px;color:#9ca3af;">
          Already know what you want? Head straight to the Shop.
        </p>
      </div>
    `);

    await transporter.sendMail({
      from: `"ReFuel Athletics" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Welcome to ReFuel, ${firstName} ⚡`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Welcome email error:', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
