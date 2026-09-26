/**
 * Premium HTML Email Templates for Tamil Food Thaya
 */

const escapeHtml = (str: string) =>
    String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const escapeAttr = (str: string) =>
    String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const BASE_STYLE = `
    font-family: 'Inter', Helvetica, Arial, sans-serif;
    line-height: 1.6;
    color: #1f2937;
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
`;

const HEADER_STYLE = `
    background-color: #09090b;
    padding: 32px;
    text-align: center;
    border-radius: 12px 12px 0 0;
`;

const CONTENT_STYLE = `
    padding: 40px 32px;
    border: 1px solid #e4e4e7;
    border-top: none;
    border-radius: 0 0 12px 12px;
`;

const FOOTER_STYLE = `
    padding: 32px;
    text-align: center;
    font-size: 12px;
    color: #71717a;
`;

const BUTTON_STYLE = `
    display: inline-block;
    padding: 12px 24px;
    background-color: #f97316;
    color: #ffffff;
    text-decoration: none;
    border-radius: 8px;
    font-weight: bold;
    margin-top: 24px;
`;

const getBaseTemplate = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="background-color: #f4f4f5; padding: 20px; margin: 0;">
    <div style="${BASE_STYLE}">
        <div style="${HEADER_STYLE}">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">
                TAMIL FOOD <span style="color: #f97316;">THAYA</span>
            </h1>
        </div>
        <div style="${CONTENT_STYLE}">
            ${content}
        </div>
        <div style="${FOOTER_STYLE}">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Tamil Food Thaya Catering. All rights reserved.</p>
            <p style="margin: 8px 0 0;">demo</p>
        </div>
    </div>
</body>
</html>
`;

export const getStatusUpdateTemplate = (data: {
    customerName: string;
    orderId: string;
    newStatus: string;
    orderType: string;
    dashboardUrl: string;
}) => {
    const statusColors: Record<string, string> = {
        pending: '#eab308',
        confirmed: '#22c55e',
        paid: '#3b82f6',
        completed: '#6366f1',
        cancelled: '#ef4444',
    };

    const color = statusColors[data.newStatus.toLowerCase()] || '#f97316';
    const orderIdSafe = escapeHtml(data.orderId.slice(-8).toUpperCase());
    const customerNameSafe = escapeHtml(data.customerName);
    const newStatusSafe = escapeHtml(data.newStatus);
    const orderTypeSafe = escapeHtml(data.orderType);
    const dashboardUrlSafe = escapeAttr(data.dashboardUrl);

    const content = `
        <h2 style="margin-top: 0; font-size: 20px; font-weight: 700;">Order Status Update</h2>
        <p>Hi ${customerNameSafe},</p>
        <p>Your <strong>${orderTypeSafe}</strong> order <span style="font-family: monospace; background: #f4f4f5; padding: 2px 4px; border-radius: 4px;">#${orderIdSafe}</span> has been updated.</p>
        
        <div style="margin: 32px 0; padding: 24px; background-color: #f8fafc; border-radius: 12px; border-left: 4px solid ${color};">
            <p style="margin: 0; font-size: 14px; text-transform: uppercase; font-weight: 800; color: #71717a; letter-spacing: 0.05em;">New Status</p>
            <p style="margin: 4px 0 0; font-size: 24px; font-weight: 800; color: ${color}; text-transform: capitalize;">${newStatusSafe}</p>
        </div>

        <p>You can view the full details of your booking and request modifications through your personal dashboard.</p>
        
        <a href="${dashboardUrlSafe}" style="${BUTTON_STYLE}">View My Dashboard</a>

        <p style="margin-top: 32px; font-size: 14px; color: #71717a;">
            If you have any urgent questions, please reply to this email or contact our support team.
        </p>
    `;

    return getBaseTemplate(`Order Status Update - ${newStatusSafe}`, content);
};

export const getVerificationEmailTemplate = (pin: string) => {
    const content = `
        <h2 style="margin-top: 0; font-size: 20px; font-weight: 700;">Verify Your Account</h2>
        <p>Welcome to Tamil Food Thaya! Please use the following PIN to verify your email address and complete your registration.</p>
        
        <div style="margin: 32px 0; padding: 32px; background-color: #f97316; border-radius: 12px; text-align: center;">
            <p style="margin: 0; font-size: 48px; font-weight: 900; color: #ffffff; letter-spacing: 0.2em; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">${pin}</p>
        </div>

        <p style="text-align: center; color: #71717a; font-size: 14px;">This PIN will expire in 1 hour.</p>
        
        <p style="margin-top: 32px; font-size: 14px; color: #71717a;">
            If you did not request this email, you can safely ignore it.
        </p>
    `;

    return getBaseTemplate('Verify Your Account', content);
};
