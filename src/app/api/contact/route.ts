import { NextRequest, NextResponse } from 'next/server';

// Contact form handler - sends email to Derek without exposing address
export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    // Validate inputs
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Option 1: Use Resend (recommended - add RESEND_API_KEY to env)
    if (process.env.RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'DBTech45 Contact <noreply@dbtech45.com>',
          to: 'derek.bobola@gmail.com',
          subject: `[DBTech45 Contact] Message from ${name}`,
          text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
          reply_to: email
        })
      });

      if (!res.ok) {
        throw new Error('Failed to send email via Resend');
      }

      return NextResponse.json({ success: true });
    }

    // Option 2: Use Formspree as fallback (add FORMSPREE_ID to env)
    if (process.env.FORMSPREE_ID) {
      const res = await fetch(`https://formspree.io/f/${process.env.FORMSPREE_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, message })
      });

      if (!res.ok) {
        throw new Error('Failed to send via Formspree');
      }

      return NextResponse.json({ success: true });
    }

    // Option 3: Log to console in development (no email service configured)
    console.log('=== CONTACT FORM SUBMISSION ===');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Message:', message);
    console.log('Destination: derek.bobola@gmail.com');
    console.log('================================');

    // In production without email service, return error
    if (process.env.NODE_ENV === 'production') {
      console.error('No email service configured. Set RESEND_API_KEY or FORMSPREE_ID');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // In development, return success for testing
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
