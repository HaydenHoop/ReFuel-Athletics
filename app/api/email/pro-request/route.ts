import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

function getAdmin() {
  const { createClient } = require('@supabase/supabase-js');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { name, email, userId } = await req.json();
    const devEmail = process.env.DEV_EMAIL || process.env.GMAIL_USER;

    await transporter.sendMail({
      from: `"ReFuel Athletics" <${process.env.GMAIL_USER}>`,
      to: devEmail,
      subject: `⚡ Pro Request: ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="font-size:20px;font-weight:900;margin-bottom:4px">New Pro Request</h2>
          <p style="color:#6b7280;font-size:14px;margin-bottom:20px">A user has requested Pro athlete status</p>
          <div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:20px">
            <p style="margin:0 0 6px;font-size:14px"><strong>Name:</strong> ${name}</p>
            <p style="margin:0 0 6px;font-size:14px"><strong>Email:</strong> ${email}</p>
            <p style="margin:0;font-size:12px;color:#9ca3af;font-family:monospace">${userId}</p>
          </div>
          <p style="font-size:13px;color:#6b7280">Review this request in the Developer Panel under "Pro Requests".</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Pro request email error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
