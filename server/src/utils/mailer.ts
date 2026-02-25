import nodemailer from 'nodemailer';

// ---------------------------------------------------------------------------
// Transporter — created lazily so missing SMTP config just silently no-ops
// ---------------------------------------------------------------------------
function createTransporter() {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false, // STARTTLS
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 10_000,  // fail in 10s if Gmail unreachable
        greetingTimeout:   10_000,  // fail in 10s if no SMTP banner
        socketTimeout:     15_000,  // fail in 15s if send stalls
    });
}

/**
 * Send an email.
 * Silently skips if SMTP is not configured — never throws.
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
    const transporter = createTransporter();
    if (!transporter) return;
    await transporter.sendMail({
        from: `"DecoyVerse Security" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        // plain-text fallback (strip HTML tags)
        text: html.replace(/<[^>]*>/g, ' ').replace(/\s{2,}/g, ' ').trim(),
    });
}

// ---------------------------------------------------------------------------
// Shared style primitives — mirrors the DecoyVerse dark theme
// ---------------------------------------------------------------------------
const DARK_BG    = '#0f1117';
const CARD_BG    = '#1a1d27';
const BORDER     = '#2a2d3a';
const RED        = '#ef4444';
const RED_DIM    = '#7f1d1d';
const RED_BG     = '#1c0a0a';
const GOLD       = '#f59e0b';
const MUTED      = '#6b7280';
const WHITE      = '#f9fafb';
const MONO       = 'Courier New, Courier, monospace';
const SANS       = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';

function statCell(icon: string, label: string, value: string, highlight = false) {
    const border = highlight ? `2px solid ${RED}` : `1px solid ${BORDER}`;
    const bg     = highlight ? RED_BG : CARD_BG;
    const color  = highlight ? RED : WHITE;
    return `
      <td width="25%" style="padding:4px">
        <div style="background:${bg};border:${border};border-radius:10px;padding:14px">
          <div style="font-size:10px;color:${MUTED};text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">${icon} ${label}</div>
          <div style="font-size:15px;font-weight:700;color:${color}">${value}</div>
        </div>
      </td>`;
}

function infoRow(label: string, value: string, mono = false) {
    return `
      <tr>
        <td style="padding:6px 0;vertical-align:top;width:40%">
          <span style="font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:.06em">${label}</span>
        </td>
        <td style="padding:6px 0;vertical-align:top">
          <span style="font-family:${mono ? MONO : SANS};font-size:13px;color:${WHITE};
                background:${mono ? '#0d1117' : 'transparent'};
                border:${mono ? `1px solid ${BORDER}` : 'none'};
                border-radius:${mono ? '4px' : '0'};
                padding:${mono ? '2px 6px' : '0'}">${value}</span>
        </td>
      </tr>`;
}

// ---------------------------------------------------------------------------
// Shared email wrapper (header + footer)
// ---------------------------------------------------------------------------
function wrapEmail(headerHtml: string, bodyHtml: string, footerNote: string): string {
    const dashboardUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>DecoyVerse</title>
</head>
<body style="margin:0;padding:0;background:${DARK_BG};font-family:${SANS}">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${DARK_BG};padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;border:1px solid ${BORDER}">

        <!-- ── Wordmark bar ─────────────────────────────────────────── -->
        <tr>
          <td style="background:${CARD_BG};padding:18px 28px;border-bottom:1px solid ${BORDER}">
            <span style="font-size:20px;font-weight:800;color:${GOLD};letter-spacing:-.5px">&#x2756; DecoyVerse</span>
            <span style="font-size:11px;color:${MUTED};margin-left:8px">Security Platform</span>
          </td>
        </tr>

        <!-- ── Alert header ─────────────────────────────────────────── -->
        ${headerHtml}

        <!-- ── Body ────────────────────────────────────────────────── -->
        <tr><td style="background:${DARK_BG};padding:24px 28px">${bodyHtml}</td></tr>

        <!-- ── CTA button ───────────────────────────────────────────── -->
        <tr>
          <td style="background:${CARD_BG};padding:20px 28px;border-top:1px solid ${BORDER};text-align:center">
            <a href="${dashboardUrl}/dashboard"
               style="display:inline-block;background:${RED};color:#fff;font-weight:700;
                      font-size:14px;padding:12px 32px;border-radius:8px;text-decoration:none;
                      letter-spacing:.04em;box-shadow:0 0 16px rgba(239,68,68,.4)">
              Open Dashboard &rarr;
            </a>
          </td>
        </tr>

        <!-- ── Footer ───────────────────────────────────────────────── -->
        <tr>
          <td style="background:${DARK_BG};padding:16px 28px;border-top:1px solid ${BORDER};text-align:center">
            <p style="font-size:11px;color:${MUTED};margin:0">${footerNote}</p>
            <p style="font-size:11px;color:${MUTED};margin:6px 0 0">DecoyVerse &bull; Cybersecurity Deception Platform</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Alert email — mirrors the ThreatModal card design
// ---------------------------------------------------------------------------
interface AlertEmailData {
    alert_id?:    string;
    attack_type?: string;
    risk_score?:  number;
    confidence?:  number;
    status?:      string;
    source_ip?:   string;
    node_id?:     string;
    service?:     string;
    activity?:    string;
    timestamp?:   string;
    payload?:     string;
}

export function alertEmailHtml(data: AlertEmailData): string {
    const attackType  = (data.attack_type || 'Unknown Attack').replace(/_/g, ' ');
    const riskScore   = data.risk_score  ?? 'N/A';
    const confidence  = data.confidence != null ? `${(data.confidence * 100).toFixed(1)}%` : 'N/A';
    const status      = data.status      || 'open';
    const sourceIp    = data.source_ip   || 'Unknown';
    const nodeId      = data.node_id     || 'Unknown';
    const service     = data.service     || 'Unknown';
    const activity    = data.activity    || 'Unknown';
    const alertId     = data.alert_id    || '—';
    const ts          = data.timestamp ? new Date(data.timestamp).toLocaleString('en-US', { timeZoneName: 'short' }) : 'Unknown';
    const riskLabel   = typeof riskScore === 'number' ? `${riskScore} / 10` : String(riskScore);

    const header = `
      <tr>
        <td style="background:${RED_BG};border-bottom:1px solid ${RED_DIM};padding:20px 28px">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <div style="font-size:11px;color:${RED};text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px">
                  &#x26A0; Critical Threat Detected
                </div>
                <div style="font-size:22px;font-weight:800;color:${WHITE}">Security Alert Triggered</div>
                <div style="font-size:12px;color:${MUTED};margin-top:4px">Alert ID: <span style="font-family:${MONO};color:${WHITE}">${alertId}</span></div>
              </td>
              <td align="right" style="vertical-align:top">
                <div style="background:${RED};color:#fff;font-size:11px;font-weight:700;
                            padding:4px 12px;border-radius:20px;text-transform:uppercase;
                            letter-spacing:.08em;display:inline-block">${status.toUpperCase()}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;

    const body = `
      <!-- Stats grid (2 columns on email, 4 on wide) -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px">
        <tr>
          ${statCell('&#x26A1;', 'Attack Type', attackType)}
          ${statCell('&#x1F6E1;', 'Risk Score', riskLabel, true)}
          ${statCell('&#x1F9EC;', 'Confidence', confidence)}
          ${statCell('&#x1F4CB;', 'Status', status.toUpperCase())}
        </tr>
      </table>

      <!-- Intelligence Payload card -->
      <div style="background:${CARD_BG};border:1px solid ${BORDER};border-radius:12px;padding:20px;margin-bottom:20px">
        <div style="font-size:10px;color:${MUTED};text-transform:uppercase;letter-spacing:.1em;
                    border-bottom:1px solid ${BORDER};padding-bottom:10px;margin-bottom:14px">
          &#x1F9E0; Intelligence Payload
        </div>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${infoRow('Source IP',   `<code style="font-family:${MONO};background:#0d1117;border:1px solid ${BORDER};border-radius:4px;padding:2px 6px">${sourceIp}</code>`)}
          ${infoRow('Node ID',     nodeId, true)}
          ${infoRow('Service',     service)}
          ${infoRow('Activity',    activity)}
          ${infoRow('Timestamp',   ts)}
        </table>
      </div>

      ${data.payload ? `
      <!-- Payload fragment (terminal style) -->
      <div style="border-radius:10px;overflow:hidden;border:1px solid ${BORDER}">
        <div style="background:#0d1117;padding:8px 14px;border-bottom:1px solid ${BORDER};
                    font-size:10px;color:${MUTED};letter-spacing:.06em;text-transform:uppercase">
          &#x2022; Target Asset / Payload Fragment
        </div>
        <div style="background:#0a0a0f;padding:16px;overflow-x:auto">
          <code style="font-family:${MONO};font-size:12px;color:#a8ff78;word-break:break-all;white-space:pre-wrap">${data.payload.substring(0, 500)}</code>
        </div>
      </div>` : ''}`;

    return wrapEmail(
        header,
        body,
        'You are receiving this because a threat was detected on your monitored node.'
    );
}

// ---------------------------------------------------------------------------
// Welcome email — sent on new user registration
// ---------------------------------------------------------------------------
export function welcomeEmailHtml(name: string, email: string): string {
    const dashboardUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const header = `
      <tr>
        <td style="background:linear-gradient(135deg,#1a1d27 0%,#0f1117 100%);
                   border-bottom:1px solid ${BORDER};padding:28px 28px 20px">
          <div style="font-size:28px;margin-bottom:8px">&#x1F6E1;</div>
          <div style="font-size:22px;font-weight:800;color:${WHITE}">Welcome to DecoyVerse!</div>
          <div style="font-size:14px;color:${MUTED};margin-top:6px">Your deception security platform is ready.</div>
        </td>
      </tr>`;

    const body = `
      <p style="font-size:15px;color:${WHITE};margin:0 0 16px">
        Hi <strong style="color:${GOLD}">${name || email}</strong>,
      </p>
      <p style="font-size:14px;color:${MUTED};margin:0 0 24px;line-height:1.6">
        Your DecoyVerse account has been created. You can now deploy AI-powered honeytokens and decoy files
        to detect intruders the moment they access anything they shouldn't.
      </p>

      <!-- Feature list -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
        ${[
            ['&#x1F4C1;', 'Deploy honeytokens',    'Fake credentials and files that trigger instant alerts'],
            ['&#x1F4F1;', 'Real-time alerts',       'Email, Slack, and WhatsApp notifications'],
            ['&#x1F916;', 'ML threat analysis',     'Random Forest classifier scores every attack'],
            ['&#x1F5FA;', 'Network monitoring',     'Detect port scans and lateral movement'],
        ].map(([icon, title, desc]) => `
          <tr>
            <td style="padding:8px 0;vertical-align:top;width:40px">
              <span style="font-size:20px">${icon}</span>
            </td>
            <td style="padding:8px 0">
              <div style="font-size:14px;font-weight:600;color:${WHITE}">${title}</div>
              <div style="font-size:12px;color:${MUTED};margin-top:2px">${desc}</div>
            </td>
          </tr>`).join('')}
      </table>

      <p style="font-size:13px;color:${MUTED};margin:0">
        Head to your dashboard and create your first node to get started.
      </p>`;

    return wrapEmail(
        header,
        body,
        `You registered with ${email}. If this wasn't you, please contact support.`
    );
}

// ---------------------------------------------------------------------------
// Test alert — dummy data so the user can preview what alerts look like
// ---------------------------------------------------------------------------
export function testAlertEmailHtml(recipientEmail: string): string {
    return alertEmailHtml({
        alert_id:    'TEST-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        attack_type: 'HONEYTOKEN_ACCESS',
        risk_score:  9,
        confidence:  0.94,
        status:      'open',
        source_ip:   '192.168.1.42',
        node_id:     'node-demo-001',
        service:     'File System',
        activity:    'Honeytoken file accessed: aws_credentials.txt',
        timestamp:   new Date().toISOString(),
        payload:     'aws_access_key_id = AKIAIOSFODNN7EXAMPLE\naws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    }).replace(
        'You are receiving this because a threat was detected on your monitored node.',
        `This is a <strong style="color:#f59e0b">TEST ALERT</strong> sent to <strong>${recipientEmail}</strong>. Real alerts will look exactly like this.`
    );
}
