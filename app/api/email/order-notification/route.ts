import nodemailer from 'nodemailer';
import { DEV_EMAILS } from '@/lib/devConfig';

export async function POST(req: Request) {
  try {
    const { orderId, firstName, lastName, email, items, shipping, subtotal, shippingCost, tax, total, promoCode, promoDiscount, subDiscount, isSubscription, subInterval } = await req.json();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const itemRows = items.map((item: any) =>
      `<tr>
        <td style="padding:8px 0;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6;">${item.emoji ?? ''} ${item.name} × ${item.qty}</td>
        <td style="padding:8px 0;font-size:13px;color:#111827;font-weight:600;text-align:right;border-bottom:1px solid #f3f4f6;">$${(item.price * item.qty).toFixed(2)}</td>
      </tr>`
    ).join('');

    const recipients = [...new Set(['haydenh.refuel@gmail.com', ...DEV_EMAILS])];

    await transporter.sendMail({
      from: `"ReFuel Orders" <${process.env.EMAIL_USER}>`,
      to: recipients.join(', '),
      subject: `💰 New Order #${orderId} — $${Number(total).toFixed(2)} from ${firstName} ${lastName}`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:580px;margin:0 auto;background:#f9fafb;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb;">
          
          <!-- Header -->
          <div style="background:#111827;padding:24px 28px;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
              <div style="width:32px;height:32px;background:#374151;border-radius:8px;display:flex;align-items:center;justify-content:center;">
                <span style="color:#fff;font-weight:900;font-size:11px;">RF</span>
              </div>
              <span style="color:#fff;font-weight:700;font-size:15px;">ReFuel Athletics</span>
            </div>
            <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 4px;letter-spacing:-0.02em;">New Order Placed 🎉</h1>
            <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0;">Order #${orderId}</p>
          </div>

          <!-- Amount hero -->
          <div style="background:#fff;padding:20px 28px;border-bottom:1px solid #e5e7eb;text-align:center;">
            <p style="font-size:36px;font-weight:900;color:#111827;margin:0;letter-spacing:-0.03em;">$${Number(total).toFixed(2)}</p>
            <p style="font-size:12px;color:#9ca3af;margin:4px 0 0;text-transform:uppercase;letter-spacing:0.08em;">${isSubscription ? `Subscription · Every ${subInterval} weeks` : 'One-time order'}</p>
          </div>

          <!-- Customer info -->
          <div style="padding:20px 28px 0;">
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px 18px;">
              <p style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 12px;">Customer</p>
              <div style="display:flex;flex-direction:column;gap:6px;">
                <div style="display:flex;gap:8px;">
                  <span style="font-size:11px;font-weight:700;color:#9ca3af;width:52px;text-transform:uppercase;">Name</span>
                  <span style="font-size:13px;font-weight:600;color:#111827;">${firstName} ${lastName}</span>
                </div>
                <div style="display:flex;gap:8px;">
                  <span style="font-size:11px;font-weight:700;color:#9ca3af;width:52px;text-transform:uppercase;">Email</span>
                  <a href="mailto:${email}" style="font-size:13px;color:#2563eb;text-decoration:none;">${email}</a>
                </div>
                <div style="display:flex;gap:8px;">
                  <span style="font-size:11px;font-weight:700;color:#9ca3af;width:52px;text-transform:uppercase;">Ship to</span>
                  <span style="font-size:13px;color:#374151;">${shipping.address}, ${shipping.city}, ${shipping.state} ${shipping.zip}</span>
                </div>
                <div style="display:flex;gap:8px;">
                  <span style="font-size:11px;font-weight:700;color:#9ca3af;width:52px;text-transform:uppercase;">Method</span>
                  <span style="font-size:13px;color:#374151;">${shipping.shippingMethod}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Items -->
          <div style="padding:16px 28px 0;">
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px 18px;">
              <p style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 10px;">Items</p>
              <table style="width:100%;border-collapse:collapse;">
                ${itemRows}
              </table>
            </div>
          </div>

          <!-- Totals -->
          <div style="padding:16px 28px 24px;">
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px 18px;">
              <p style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 10px;">Breakdown</p>
              <div style="display:flex;flex-direction:column;gap:6px;font-size:13px;">
                <div style="display:flex;justify-content:space-between;color:#6b7280;"><span>Subtotal</span><span>$${Number(subtotal).toFixed(2)}</span></div>
                ${subDiscount > 0 ? `<div style="display:flex;justify-content:space-between;color:#059669;"><span>Subscription discount (10%)</span><span>−$${Number(subDiscount).toFixed(2)}</span></div>` : ''}
                ${promoDiscount > 0 ? `<div style="display:flex;justify-content:space-between;color:#059669;"><span>Promo (${promoCode})</span><span>−$${Number(promoDiscount).toFixed(2)}</span></div>` : ''}
                <div style="display:flex;justify-content:space-between;color:#6b7280;"><span>Shipping</span><span>${Number(shippingCost) === 0 ? 'Free' : `$${Number(shippingCost).toFixed(2)}`}</span></div>
                <div style="display:flex;justify-content:space-between;color:#6b7280;"><span>Tax</span><span>$${Number(tax).toFixed(2)}</span></div>
                <div style="display:flex;justify-content:space-between;color:#111827;font-weight:800;font-size:15px;padding-top:8px;border-top:1px solid #f3f4f6;margin-top:4px;"><span>Total</span><span>$${Number(total).toFixed(2)}</span></div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="background:#f3f4f6;padding:14px 28px;border-top:1px solid #e5e7eb;">
            <p style="font-size:11px;color:#9ca3af;margin:0;text-align:center;">ReFuel Athletics · Order notification</p>
          </div>
        </div>
      `,
    });

    return Response.json({ success: true });
  } catch (err: unknown) {
    console.error('Order notification email error:', err);
    return Response.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
