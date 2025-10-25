// Notification utility for lead notifications
// Will be implemented with Resend once configured

interface Lead {
  id: string;
  type: 'tour_request' | 'message';
  name: string;
  email: string;
  phone?: string | null;
  preferredDate?: Date | null;
  preferredTimeWindow?: 'morning' | 'afternoon' | 'evening' | null;
  message?: string | null;
  source?: string | null;
}

interface Property {
  title: string;
  slug: string;
}

interface Team {
  name: string;
  // Add team email or agent emails here
}

export async function notifyLeadReceived(
  lead: Lead,
  property: Property | undefined,
  team: Team
): Promise<void> {
  // TODO: Implement with Resend
  // For now, just log to console
  
  console.log('📧 New Lead Notification:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Type: ${lead.type === 'tour_request' ? '🗓️  Tour Request' : '💬 Message'}`);
  if (property) {
    console.log(`Property: ${property.title}`);
  }
  console.log(`From: ${lead.name} (${lead.email})`);
  
  if (lead.phone) {
    console.log(`Phone: ${lead.phone}`);
  }
  
  if (lead.type === 'tour_request' && lead.preferredDate) {
    console.log(`Preferred Date: ${lead.preferredDate.toLocaleDateString()}`);
    if (lead.preferredTimeWindow) {
      console.log(`Time Window: ${lead.preferredTimeWindow}`);
    }
  }
  
  if (lead.message) {
    console.log(`Message: ${lead.message}`);
  }
  
  console.log(`Source: ${lead.source || 'unknown'}`);
  if (property) {
    console.log(`View Property: /p/${property.slug}`);
  }
  console.log(`Manage Lead: /dashboard/leads`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // TODO: Implement actual email sending with Resend
  // Example:
  // const { Resend } = await import('resend');
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // 
  // await resend.emails.send({
  //   from: 'Listing.Show <notifications@listing.show>',
  //   to: [teamEmail],
  //   subject: `New ${lead.type === 'tour_request' ? 'Tour Request' : 'Message'} for ${property.title}`,
  //   html: generateEmailTemplate(lead, property),
  // });
}

// Email template generator (for future Resend implementation)
function generateEmailTemplate(lead: Lead, property: Property): string {
  const timeWindowLabels = {
    morning: 'Morning (8am - 12pm)',
    afternoon: 'Afternoon (12pm - 5pm)',
    evening: 'Evening (5pm - 8pm)',
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #162144; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .info-row { margin: 15px 0; }
          .label { font-weight: 600; color: #6b7280; }
          .value { color: #111827; }
          .button { display: inline-block; background: #3f7b74; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">New ${lead.type === 'tour_request' ? 'Tour Request' : 'Message'}</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">${property.title}</p>
          </div>
          <div class="content">
            <div class="info-row">
              <div class="label">Name</div>
              <div class="value">${lead.name}</div>
            </div>
            <div class="info-row">
              <div class="label">Email</div>
              <div class="value"><a href="mailto:${lead.email}">${lead.email}</a></div>
            </div>
            ${lead.phone ? `
            <div class="info-row">
              <div class="label">Phone</div>
              <div class="value"><a href="tel:${lead.phone}">${lead.phone}</a></div>
            </div>
            ` : ''}
            ${lead.preferredDate ? `
            <div class="info-row">
              <div class="label">Preferred Date</div>
              <div class="value">${lead.preferredDate.toLocaleDateString()}</div>
            </div>
            ` : ''}
            ${lead.preferredTimeWindow ? `
            <div class="info-row">
              <div class="label">Preferred Time</div>
              <div class="value">${timeWindowLabels[lead.preferredTimeWindow]}</div>
            </div>
            ` : ''}
            ${lead.message ? `
            <div class="info-row">
              <div class="label">Message</div>
              <div class="value">${lead.message}</div>
            </div>
            ` : ''}
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://listing.show'}/dashboard/leads" class="button">
              View in Dashboard
            </a>
          </div>
        </div>
      </body>
    </html>
  `;
}
