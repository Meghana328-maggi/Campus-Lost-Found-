const nodemailer = require('nodemailer');

let transporter = null;

const initTransporter = () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    console.log('[EmailService] SMTP transporter configured with provided credentials.');
  } else {
    console.log('[EmailService] SMTP credentials not provided. Simulating emails via dev console.');
  }
};

initTransporter();

const sendMail = async ({ to, subject, html, text }) => {
  try {
    const from = process.env.EMAIL_FROM || '"Campus Lost & Found" <noreply@campuslostfound.edu>';

    if (transporter) {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });
      console.log(`[Email Sent] Message sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } else {
      // Dev mode fallback
      console.log('\n================== SIMULATED EMAIL ==================');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content:\n${text || html}`);
      console.log('====================================================\n');
      return { success: true, simulated: true };
    }
  } catch (error) {
    console.error(`[EmailService Error]: Could not send email to ${to}: ${error.message}`);
    // Do not crash the application
    return { success: false, error: error.message };
  }
};

const sendWelcomeEmail = async (user) => {
  return sendMail({
    to: user.email,
    subject: 'Welcome to Campus Lost & Found Platform',
    html: `
      <h2>Hello ${user.name},</h2>
      <p>Welcome to the <strong>Campus Lost & Found Platform</strong>.</p>
      <p>You can now report lost or found items, search the campus directory, and submit ownership claims securely.</p>
      <br/>
      <p>Best regards,<br/>Campus Support Team</p>
    `,
    text: `Hello ${user.name},\nWelcome to the Campus Lost & Found Platform! You can now report lost or found items and search the campus directory.`,
  });
};

const sendPasswordResetEmail = async (user, resetUrl) => {
  return sendMail({
    to: user.email,
    subject: 'Password Reset Request - Campus Lost & Found',
    html: `
      <h2>Hello ${user.name},</h2>
      <p>You requested a password reset. Please click the link below to set a new password:</p>
      <p><a href="${resetUrl}" style="padding:10px 15px;background:#4F46E5;color:white;text-decoration:none;border-radius:5px;">Reset Password</a></p>
      <p>If you did not request this, please ignore this email. Link expires in 10 minutes.</p>
      <p>${resetUrl}</p>
    `,
    text: `Hello ${user.name},\nYou requested a password reset. Reset using this link: ${resetUrl}\nExpires in 10 minutes.`,
  });
};

const sendClaimNotificationEmail = async ({ owner, item, claimant }) => {
  return sendMail({
    to: owner.email,
    subject: `New Claim Submitted for your item: ${item.title}`,
    html: `
      <h2>Hello ${owner.name},</h2>
      <p>A new ownership claim has been submitted for <strong>${item.title}</strong> by ${claimant.name}.</p>
      <p>Please log in to your dashboard to review their verification answers and proof.</p>
      <br/>
      <p>Campus Lost & Found Team</p>
    `,
    text: `Hello ${owner.name},\nA new ownership claim has been submitted for ${item.title} by ${claimant.name}. Please check your dashboard to review.`,
  });
};

const sendClaimStatusEmail = async ({ claimant, item, status, rejectionReason }) => {
  const isApproved = status === 'approved';
  return sendMail({
    to: claimant.email,
    subject: `Your Claim for "${item.title}" was ${isApproved ? 'Approved!' : 'Rejected'}`,
    html: `
      <h2>Hello ${claimant.name},</h2>
      <p>Your ownership claim for <strong>${item.title}</strong> has been <strong>${status.toUpperCase()}</strong>.</p>
      ${!isApproved && rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
      ${isApproved ? '<p>You can now message the finder in real-time on the platform to arrange a safe campus handover!</p>' : ''}
      <br/>
      <p>Campus Lost & Found Team</p>
    `,
    text: `Hello ${claimant.name},\nYour ownership claim for "${item.title}" was ${status}. ${rejectionReason ? 'Reason: ' + rejectionReason : ''}`,
  });
};

module.exports = {
  sendMail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendClaimNotificationEmail,
  sendClaimStatusEmail,
};
