import { toast } from 'sonner@2.0.3';

// EmailJS configuration
// To enable email notifications:
// 1. Sign up at https://www.emailjs.com/
// 2. Create an email service (Gmail, Outlook, etc.)
// 3. Create email templates for registration and complaint resolution
// 4. Replace the values below with your EmailJS credentials

const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID'; // Replace with your EmailJS service ID
const EMAILJS_TEMPLATE_ID_REGISTRATION = 'YOUR_REGISTRATION_TEMPLATE_ID'; // Replace with your registration template ID
const EMAILJS_TEMPLATE_ID_RESOLUTION = 'YOUR_RESOLUTION_TEMPLATE_ID'; // Replace with your resolution template ID
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Replace with your EmailJS public key

// Check if EmailJS is configured
const isEmailConfigured = () => {
  return EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID' && 
         EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY';
};

// Load EmailJS script
const loadEmailJS = () => {
  return new Promise((resolve, reject) => {
    if ((window as any).emailjs) {
      resolve((window as any).emailjs);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    script.onload = () => {
      (window as any).emailjs.init(EMAILJS_PUBLIC_KEY);
      resolve((window as any).emailjs);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Send registration email
export const sendRegistrationEmail = async (
  userEmail: string,
  userName: string,
  userRole: string
) => {
  if (!isEmailConfigured()) {
    console.log('Email not configured. Simulating email send...');
    toast.success(`📧 Welcome email would be sent to ${userEmail}`);
    return;
  }

  try {
    const emailjs = await loadEmailJS();
    
    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      role: userRole,
      app_name: 'BlockFix',
      login_url: window.location.origin,
    };

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_REGISTRATION,
      templateParams
    );

    toast.success(`📧 Welcome email sent to ${userEmail}`);
  } catch (error) {
    console.error('Failed to send registration email:', error);
    toast.warning('Account created but email notification failed. Please check your email configuration.');
  }
};

// Send complaint resolution email
export const sendResolutionEmail = async (
  userEmail: string,
  userName: string,
  complaintTitle: string,
  complaintId: string,
  resolution: string
) => {
  if (!isEmailConfigured()) {
    console.log('Email not configured. Simulating email send...');
    toast.success(`📧 Resolution email would be sent to ${userEmail}`);
    return;
  }

  try {
    const emailjs = await loadEmailJS();
    
    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      complaint_title: complaintTitle,
      complaint_id: complaintId,
      resolution: resolution,
      app_name: 'BlockFix',
      dashboard_url: window.location.origin,
    };

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_RESOLUTION,
      templateParams
    );

    toast.success(`📧 Resolution notification sent to ${userEmail}`);
  } catch (error) {
    console.error('Failed to send resolution email:', error);
    toast.warning('Complaint resolved but email notification failed.');
  }
};

// Simulate email notification (for demo purposes)
export const simulateEmailNotification = (
  type: 'registration' | 'resolution',
  userEmail: string,
  details: any
) => {
  const emailContent = type === 'registration' 
    ? `
      ═══════════════════════════════════════
      📧 REGISTRATION EMAIL (Simulated)
      ═══════════════════════════════════════
      
      To: ${userEmail}
      Subject: Welcome to BlockFix!
      
      Dear ${details.name},
      
      Welcome to BlockFix - AI-Powered Grievance Redressal System!
      
      Your account has been successfully created with the following details:
      - Email: ${userEmail}
      - Role: ${details.role}
      - Account ID: ${details.id}
      
      You can now:
      ✓ Submit complaints with voice input
      ✓ Track complaint status in real-time
      ✓ Earn rewards for participation
      ✓ Access our AI-powered categorization
      
      Login at: ${window.location.origin}
      
      Best regards,
      The BlockFix Team
      
      ═══════════════════════════════════════
    `
    : `
      ═══════════════════════════════════════
      📧 RESOLUTION EMAIL (Simulated)
      ═══════════════════════════════════════
      
      To: ${userEmail}
      Subject: Your Complaint Has Been Resolved!
      
      Dear ${details.name},
      
      Good news! Your complaint has been resolved.
      
      Complaint Details:
      - Title: ${details.title}
      - ID: ${details.id}
      - Category: ${details.category}
      - Status: ✅ RESOLVED
      
      Resolution:
      ${details.resolution || 'The issue has been addressed by our team.'}
      
      Please log in to your dashboard to:
      - View resolution details
      - Confirm the resolution
      - Rate the service quality
      
      Thank you for using BlockFix!
      
      Best regards,
      The BlockFix Team
      
      ═══════════════════════════════════════
    `;

  console.log(emailContent);
  
  if (type === 'registration') {
    toast.success(`✅ Registration successful! Check console for simulated email to ${userEmail}`);
  } else {
    toast.success(`✅ Complaint resolved! Check console for simulated email to ${userEmail}`);
  }
};
