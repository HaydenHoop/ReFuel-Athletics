import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { subject, name, email, message } = await req.json();

    if (!subject || !name || !email || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"ReFuel Contact Form" <${process.env.GMAIL_USER}>`,
      to: 'haydenh.refuel@gmail.com',
      subject: `[Contact Form] ${subject}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; background: #f9fafb; border-radius: 14px; overflow: hidden; border: 1px solid #e5e7eb;">
          
          <!-- Header -->
          <div style="background: #111827; padding: 24px 28px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 32px; height: 32px; background: #374151; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <span style="color: #fff; font-weight: 900; font-size: 11px; letter-spacing: -0.5px;">RF</span>
              </div>
              <span style="color: #fff; font-weight: 700; font-size: 15px;">ReFuel Athletics</span>
            </div>
            <h1 style="color: #fff; font-size: 20px; font-weight: 800; margin: 14px 0 4px; letter-spacing: -0.02em;">New Contact Form Submission</h1>
            <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 0;">Received via refuelathletics.com</p>
          </div>

          <!-- Topic badge -->
          <div style="padding: 20px 28px 0;">
            <span style="display: inline-block; background: #111827; color: #fff; font-size: 11px; font-weight: 700; padding: 5px 12px; border-radius: 20px; letter-spacing: 0.05em; text-transform: uppercase;">
              ${subject}
            </span>
          </div>

          <!-- Sender info -->
          <div style="padding: 16px 28px 0;">
            <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px 18px; display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; gap: 8px; align-items: center;">
                <span style="font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; width: 48px;">Name</span>
                <span style="font-size: 14px; font-weight: 600; color: #111827;">${name}</span>
              </div>
              <div style="height: 1px; background: #f3f4f6;"></div>
              <div style="display: flex; gap: 8px; align-items: center;">
                <span style="font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; width: 48px;">Email</span>
                <a href="mailto:${email}" style="font-size: 14px; font-weight: 600; color: #2563eb; text-decoration: none;">${email}</a>
              </div>
            </div>
          </div>

          <!-- Message -->
          <div style="padding: 16px 28px 24px;">
            <p style="font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px;">Message</p>
            <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px 18px;">
              <p style="font-size: 14px; color: #374151; line-height: 1.65; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f3f4f6; padding: 14px 28px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 11px; color: #9ca3af; margin: 0; text-align: center;">
              Reply directly to this email to respond to ${name} at ${email}
            </p>
          </div>
        </div>
      `,
      replyTo: email,
    });

    return Response.json({ success: true });
  } catch (err: unknown) {
    console.error('Contact email error:', err);
    const message = err instanceof Error ? err.message : 'Failed to send email';
    return Response.json({ error: message }, { status: 500 });
  }
}
