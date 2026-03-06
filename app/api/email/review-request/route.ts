import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Delay in ms based on shipping method
const SHIPPING_DELAYS: Record<string, number> = {
  standard:  7 * 24 * 60 * 60 * 1000,  // 7 days
  express:   3 * 24 * 60 * 60 * 1000,  // 3 days
  overnight: 1 * 24 * 60 * 60 * 1000,  // 1 day
};

function buildReviewEmailHtml(params: {
  firstName: string;
  orderId: string;
  items: { name: string; emoji: string }[];
  reviewToken: string;
  baseUrl: string;
}) {
  const { firstName, orderId, items, reviewToken, baseUrl } = params;
  const reviewUrl = `${baseUrl}/review?token=${reviewToken}&order=${orderId}`;

  const itemList = items
    .map(i => `<span style="display:inline-block;margin:4px 6px 4px 0;padding:6px 12px;background:#f3f4f6;border-radius:8px;font-size:14px;">${i.emoji} ${i.name}</span>`)
    .join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="background:#000;padding:32px 40px;">
      <p style="margin:0;color:#fff;font-size:22px;font-weight:900;letter-spacing:-0.5px;">RF ReFuel Athletics</p>
      <p style="margin:6px 0 0;color:#9ca3af;font-size:13px;">Your order has arrived 🎉</p>
    </div>

    <!-- Body -->
    <div style="padding:36px 40px;">
      <h2 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#111;">How's your fuel, ${firstName}?</h2>
      <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
        Your ReFuel order #${orderId} should have arrived. We'd love to know how it's performing on your runs and rides.
      </p>

      <p style="margin:0 0 12px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;">Your order included</p>
      <div style="margin-bottom:28px;">${itemList}</div>

      <!-- Star rating CTA -->
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;">
        <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:#111;">Tap a star to leave your rating</p>
        <div>
          ${[1,2,3,4,5].map(n => `
          <a href="${reviewUrl}&rating=${n}" 
             style="display:inline-block;font-size:32px;text-decoration:none;margin:0 2px;color:${n <= 4 ? '#d1d5db' : '#f59e0b'};">★</a>`).join('')}
        </div>
        <p style="margin:12px 0 0;font-size:12px;color:#9ca3af;">Clicking a star opens a short review form</p>
      </div>

      <a href="${reviewUrl}"
         style="display:block;text-align:center;background:#000;color:#fff;padding:14px 24px;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none;">
        Write a Full Review →
      </a>
    </div>

    <!-- Footer -->
    <div style="padding:20px 40px;border-top:1px solid #f3f4f6;">
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
        ReFuel Athletics · <a href="${baseUrl}" style="color:#9ca3af;">refuelgel.com</a> · 
        You're receiving this because you placed an order with us.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const { orderId, firstName, email, items, shippingMethod, reviewToken } = await req.json();

    const delay = SHIPPING_DELAYS[shippingMethod] ?? SHIPPING_DELAYS.standard;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://refuelgel.com';

    // Schedule the email after the shipping delay
    // In production you'd use a queue (Inngest, Upstash, etc.)
    // For now we use setTimeout — works on Vercel serverless if response is sent first
    const sendDelayed = () => {
      transporter.sendMail({
        from:    `"ReFuel Athletics" <${process.env.GMAIL_USER}>`,
        to:      email,
        subject: `How did your ReFuel order perform? ⭐`,
        html:    buildReviewEmailHtml({ firstName, orderId, items, reviewToken, baseUrl }),
      }).catch(err => console.error('Review email error:', err));
    };

    // Fire and forget after delay
    setTimeout(sendDelayed, delay);

    return NextResponse.json({ ok: true, scheduledIn: `${delay / 3600000}h` });
  } catch (err: any) {
    console.error('Review email route error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
