# Email Service

This module provides a flexible and scalable email service for the application, supporting different types of emails like welcome messages, newsletters, and ebook deliveries.

## Features

- **Templating**: Uses Handlebars for flexible email templates
- **Multiple Email Types**: Support for different email types (welcome, newsletter, ebook delivery)
- **Attachments**: Send files like PDFs with emails
- **Responsive Design**: Emails are mobile-friendly
- **Unsubscribe Links**: Built-in support for unsubscribe functionality

## Setup

1. **Environment Variables**: Add these to your `.env.local` file:

```env
# Email Configuration
EMAIL_HOST=smtp.zoho.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your@zoho.com
EMAIL_PASSWORD=your-zoho-app-password
EMAIL_FROM_EMAIL=your@zoho.com
EMAIL_FROM_NAME="Your Brand"
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME="Your Brand"
```

2. **Zoho SMTP Setup**:
   - Log in to your Zoho account
   - Go to Mail → Control Panel → Mail Configuration → SMTP/IMAP
   - Generate an App Password specifically for your application

## Usage

### Sending Emails

Use the `sendEmail` utility function to send emails:

```typescript
import { sendEmail, emailTemplates } from '@/lib/email/sendEmail'

// Send a welcome email
await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to Our Service!',
  template: emailTemplates.WELCOME,
  data: {
    name: 'John Doe',
    welcomeMessage: 'Thank you for joining us!',
    ctaUrl: 'https://example.com/get-started',
    ctaText: 'Get Started',
  },
})

// Send a newsletter
await sendEmail({
  to: 'user@example.com',
  subject: 'Our Latest Updates',
  template: emailTemplates.NEWSLETTER,
  data: {
    name: 'John',
    featuredImage: 'https://example.com/images/newsletter.jpg',
    content:
      "<h3>Check out our latest features!</h3><p>We've added new tools to help you be more productive.</p>",
    ctaUrl: 'https://example.com/updates',
    ctaText: 'Read More',
    showUnsubscribe: true,
  },
})

// Send an ebook with attachment
await sendEmail({
  to: 'user@example.com',
  subject: 'Your Free Ebook',
  template: emailTemplates.EBOOK_DELIVERY,
  data: {
    name: 'John',
    ebookTitle: 'The Ultimate Guide to Productivity',
    ebookDescription: 'Learn how to be more productive with our comprehensive guide.',
    ebookCover: 'https://example.com/images/ebook-cover.jpg',
    downloadUrl: 'https://example.com/downloads/ultimate-guide.pdf',
    expiryNotice: 'This link will expire in 7 days.',
    additionalContent:
      '<p>We hope you enjoy this free resource. Let us know if you have any questions!</p>',
  },
  attachments: [
    {
      filename: 'ultimate-guide.pdf',
      path: '/path/to/ultimate-guide.pdf',
      contentType: 'application/pdf',
    },
  ],
})
```

### Email Templates

Email templates are located in the `templates/emails` directory. The base layout is defined in `templates/emails/layouts/base.hbs`.

#### Creating a New Template

1. Create a new `.hbs` file in the `templates/emails` directory
2. Start with the base layout:

```handlebars
{{!< layouts/base}}

<!-- Your email content here -->
<p>Hello {{name}},</p>

{{{content}}}
```

3. Use Handlebars syntax for dynamic content
4. Add your styles inline or in the `<style>` tag in the base layout

## API Endpoint

You can also send emails via the API endpoint:

```typescript
const response = await fetch('/api/email/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: 'user@example.com',
    subject: 'Hello!',
    template: 'welcome',
    data: {
      name: 'John',
      // ... other template data
    },
  }),
})

const result = await response.json()
```

## Error Handling

The `sendEmail` function returns a promise that resolves to an object with:

```typescript
{
  success: boolean;
  error?: string;
}
```

Check the `success` flag to determine if the email was sent successfully. If not, the `error` property will contain an error message.

## Testing

To test the email service:

1. Use a service like [Mailtrap](https://mailtrap.io/) in development
2. Update the SMTP settings in your `.env.local` file
3. Send a test email using the `sendEmail` function

## Production Considerations

- **Rate Limiting**: Implement rate limiting to prevent abuse
- **Queue System**: For high-volume email sending, consider implementing a queue system
- **Email Verification**: Verify email addresses before sending to reduce bounce rates
- **Monitoring**: Monitor email delivery rates and bounce rates
- **Unsubscribe**: Always include an unsubscribe link in marketing emails to comply with regulations like CAN-SPAM and GDPR
