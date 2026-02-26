import { NextRequest, NextResponse } from 'next/server';
import { transporter, emailWrapper } from '@/lib/mailer';

interface OrderItem {
  emoji: string;
  name: string;
  qty: number;
  price: number;
}

export async function POST(req: NextRequest) {
  try {
    const { orderId, firstName, email, items, shipping, subtotal, shippingCost, tax, total } = await req.json();

    if (!email || !orderId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const shippingLabels: Record<string, string> = {
      standard: 'Standard (5–7 business days)',
      express:  'Express (2–3 business days)',
      overnight: 'Overnight (next business day)',
    };

    const itemRows = (items as OrderItem[]).map(item => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#374151;">
          ${item.emoji} ${item.name}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#374151;text-align:right;">
          ×${item.qty}
        </td>
        <td style="padding:10px 0 10px 16px;border-bottom:1px solid #f3f4f6;font-size:14px;font-weight:700;color:#111827;text-align:right;white-space:nowrap;">
          $${(item.price * item.qty).toFixed(2)}
        </td>
      </tr>
    `).join('');

    const html = emailWrapper(`
      <!-- Hero -->
      <div style="text-align:center;margin-bottom:28px;">
        <div style="font-size:48px;margin-bottom:12px;">✅</div>
        <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#111827;letter-spacing:-0.5px;">
          Order Confirmed!
        </h1>
        <p style="margin:0;font-size:15px;color:#6b7280;">
          Thanks, ${firstName}. Your ReFuel order is in the queue.
        </p>
      </div>

      <!-- Order ID chip -->
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:12px 16px;text-align:center;margin-bottom:24px;">
        <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;">Order Number</p>
        <p style="margin:4px 0 0;font-size:16px;font-weight:900;font-family:monospace;color:#111827;">ORD-${orderId}</p>
      </div>

      <!-- Items -->
      <p style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;">
        Items
      </p>
      <table cellpadding="0" cellspacing="0" width="100%">
        ${itemRows}
      </table>

      <!-- Cost breakdown -->
      <table cellpadding="0" cellspacing="0" width="100%" style="margin-top:16px;">
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#6b7280;">Subtotal</td>
          <td style="padding:4px 0;font-size:13px;color:#6b7280;text-align:right;">$${Number(subtotal).toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#6b7280;">Shipping</td>
          <td style="padding:4px 0;font-size:13px;color:#6b7280;text-align:right;">${Number(shippingCost) === 0 ? '<span style="color:#16a34a;font-weight:600;">Free</span>' : `$${Number(shippingCost).toFixed(2)}`}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#6b7280;">Tax</td>
          <td style="padding:4px 0;font-size:13px;color:#6b7280;text-align:right;">$${Number(tax).toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0 0;font-size:16px;font-weight:900;color:#111827;border-top:2px solid #111827;margin-top:8px;">Total</td>
          <td style="padding:8px 0 0;font-size:16px;font-weight:900;color:#111827;text-align:right;border-top:2px solid #111827;">$${Number(total).toFixed(2)}</td>
        </tr>
      </table>

      <!-- Divider -->
      <div style="border-top:1px solid #f3f4f6;margin:24px 0;"></div>

      <!-- Shipping info -->
      <p style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;">
        Shipping To
      </p>
      <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">${shipping.firstName} ${shipping.lastName}</p>
      <p style="margin:2px 0;font-size:14px;color:#6b7280;">${shipping.address}</p>
      <p style="margin:2px 0;font-size:14px;color:#6b7280;">${shipping.city}, ${shipping.state} ${shipping.zip}</p>
      <p style="margin:8px 0 0;font-size:13px;color:#9ca3af;">
        ${shippingLabels[shipping.shippingMethod] || 'Standard shipping'}
      </p>

      <!-- Divider -->
      <div style="border-top:1px solid #f3f4f6;margin:24px 0;"></div>

      <!-- CTA -->
      <div style="text-align:center;">
        <a href="http://localhost:3000"
          style="display:inline-block;background:#000000;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:12px;">
          View Your Account →
        </a>
        <p style="margin:14px 0 0;font-size:12px;color:#9ca3af;">
          Questions? Reply to this email and we'll get back to you.
        </p>
      </div>
    `);

    await transporter.sendMail({
      from: `"ReFuel Athletics" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Your ReFuel order is confirmed — ORD-${orderId} ✅`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Order email error:', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
