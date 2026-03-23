const crypto = require('crypto');
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
}

function timingSafeEqual(a, b) {
  const ba = Buffer.from(String(a || ''), 'utf8');
  const bb = Buffer.from(String(b || ''), 'utf8');
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

// Function to send payment confirmation email
async function sendConfirmationEmail({ name, email, amount, paymentId, orderId, phone, state, domain }) {
  const GMAIL_USER = process.env.GMAIL_USER;
  const GMAIL_PASS = process.env.GMAIL_PASS;
  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'admin@example.com').split(',');

  if (!GMAIL_USER || !GMAIL_PASS) {
    console.warn('Email credentials missing, skipping email');
    return;
  }

  const formattedAmount = `₹${(Number(amount) / 100).toLocaleString('en-IN')}`;
  const paidAt = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata'
  });
  const receiptId = `RCPT-${Date.now()}`;

  const htmlReceipt = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#f3f4f6; padding:24px;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;box-shadow:0 12px 30px rgba(15,23,42,0.16);overflow:hidden;">
        <div style="padding:18px 22px;border-bottom:1px solid #e5e7eb;background:linear-gradient(135deg,#0f172a,#1d4ed8);color:#f9fafb;">
          <h1 style="margin:0;font-size:20px;">Payment Receipt</h1>
          <p style="margin:4px 0 0;font-size:13px;opacity:.9;">Thank you for your payment to Accenlearn.</p>
        </div>
        <div style="padding:18px 22px 8px;">
          <p style="margin:0 0 10px;font-size:14px;color:#111827;">
            Hello <strong>${name}</strong>,
          </p>
          <p style="margin:0 0 18px;font-size:13px;color:#4b5563;">
            This is a confirmation of your payment. Your enrollment status will be updated shortly.
          </p>
          <table style="width:100%;border-collapse:collapse;font-size:13px;color:#111827;">
            <tbody>
              <tr>
                <td style="padding:6px 4px;font-weight:600;width:40%;">Receipt ID</td>
                <td style="padding:6px 4px;">${receiptId}</td>
              </tr>
              <tr>
                <td style="padding:6px 4px;font-weight:600;width:40%;">Name</td>
                <td style="padding:6px 4px;">${name}</td>
              </tr>
              <tr>
                <td style="padding:6px 4px;font-weight:600;">Email</td>
                <td style="padding:6px 4px;">${email}</td>
              </tr>
              \${phone ? \`<tr><td style="padding:6px 4px;font-weight:600;">Phone</td><td style="padding:6px 4px;">\${phone}</td></tr>\` : ''}
              \${state ? \`<tr><td style="padding:6px 4px;font-weight:600;">State</td><td style="padding:6px 4px;">\${state}</td></tr>\` : ''}
              \${domain ? \`<tr><td style="padding:6px 4px;font-weight:600;">Domain / Interest</td><td style="padding:6px 4px;">\${domain}</td></tr>\` : ''}
              <tr>
                <td style="padding:6px 4px;font-weight:600;">Amount Paid</td>
                <td style="padding:6px 4px;">\${formattedAmount}</td>
              </tr>
              <tr>
                <td style="padding:6px 4px;font-weight:600;">Payment ID</td>
                <td style="padding:6px 4px;">\${paymentId}</td>
              </tr>
              <tr>
                <td style="padding:6px 4px;font-weight:600;">Order ID</td>
                <td style="padding:6px 4px;">\${orderId}</td>
              </tr>
              <tr>
                <td style="padding:6px 4px;font-weight:600;">Payment Date &amp; Time</td>
                <td style="padding:6px 4px;">\${paidAt}</td>
              </tr>
              <tr>
                <td style="padding:6px 4px;font-weight:600;">Payment Status</td>
                <td style="padding:6px 4px;">Completed</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="padding:14px 22px 18px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;">
          <p style="margin:0 0 4px;"><strong>Receipt Summary:</strong> \${formattedAmount} paid via Razorpay.</p>
          <p style="margin:0 0 4px;">If any of the details above are incorrect, please reply to this email.</p>
          <p style="margin:0;">Regards,<br/>Accenlearn Payments</p>
        </div>
      </div>
    </div>
  `;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_PASS
    }
  });

  const adminMail = {
    from: `"Accenlearn Payments" <\${GMAIL_USER}>`,
    to: ADMIN_EMAILS.join(','),
    subject: 'New Razorpay Payment – Completed',
    html: htmlReceipt
  };

  const clientMail = {
    from: `"Accenlearn Payments" <\${GMAIL_USER}>`,
    to: email,
    subject: 'Your Payment Receipt – Completed',
    html: htmlReceipt
  };

  await transporter.sendMail(adminMail);
  await transporter.sendMail(clientMail);
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { success: false, message: 'Method not allowed' });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return json(500, { success: false, message: 'Payment verification not configured.' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { success: false, message: 'Invalid JSON payload.' });
  }

  const orderId = String(payload.razorpay_order_id || '');
  const paymentId = String(payload.razorpay_payment_id || '');
  const signature = String(payload.razorpay_signature || '');

  if (!orderId || !paymentId || !signature) {
    return json(400, { success: false, message: 'Missing Razorpay verification fields.' });
  }

  const expected = crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex');
  if (!timingSafeEqual(expected, signature)) {
    return json(401, { success: false, message: 'Invalid payment signature.' });
  }

  try {
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    // Fetch order details to get notes (user info)
    const order = await razorpay.orders.fetch(orderId);
    const { name, email, phone, state, domain } = order.notes || {};

    // Send confirmation email asynchronously (Netlify functions wait for promises)
    await sendConfirmationEmail({
      name: name || 'Customer',
      email,
      amount: order.amount,
      paymentId: paymentId,
      orderId: orderId,
      phone,
      state,
      domain
    });

    return json(200, { success: true, message: 'Payment verified and receipt emailed.' });
  } catch (err) {
    console.error('Error fetching order or sending email:', err);
    // Still return success if signature was verified, but email failed
    return json(200, { success: true, message: 'Payment verified but email failed.' });
  }
};
