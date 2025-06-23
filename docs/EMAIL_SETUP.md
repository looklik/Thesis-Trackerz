# Email Setup Guide

This guide will help you set up email notifications for the Thesis Tracker application.

## Overview

The system sends email notifications to advisors when:
- A new thesis proposal is submitted
- Thesis status changes occur
- Important updates require attention

## Environment Variables

Add the following variables to your `.env` file:

```env
# Email Configuration
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_SECURE="false"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"
NEXTAUTH_URL="http://localhost:3000"
```

## Supported Email Providers

### Gmail Setup

1. **Enable 2-Factor Authentication**
   - Go to Google Account settings
   - Enable 2-factor authentication

2. **Generate App Password**
   - Go to Google Account > Security > App passwords
   - Generate a new app password for "Mail"
   - Use this password as `EMAIL_SERVER_PASSWORD`

3. **Configuration**
   ```env
   EMAIL_SERVER_HOST="smtp.gmail.com"
   EMAIL_SERVER_PORT="587"
   EMAIL_SERVER_SECURE="false"
   EMAIL_SERVER_USER="your-gmail@gmail.com"
   EMAIL_SERVER_PASSWORD="your-16-char-app-password"
   EMAIL_FROM="your-gmail@gmail.com"
   ```

### Outlook/Hotmail Setup

1. **Enable App Password**
   - Go to Microsoft Account Security settings
   - Enable app passwords

2. **Configuration**
   ```env
   EMAIL_SERVER_HOST="smtp-mail.outlook.com"
   EMAIL_SERVER_PORT="587"
   EMAIL_SERVER_SECURE="false"
   EMAIL_SERVER_USER="your-email@outlook.com"
   EMAIL_SERVER_PASSWORD="your-app-password"
   EMAIL_FROM="your-email@outlook.com"
   ```

### Yahoo Mail Setup

1. **Generate App Password**
   - Go to Yahoo Account Security
   - Generate app password

2. **Configuration**
   ```env
   EMAIL_SERVER_HOST="smtp.mail.yahoo.com"
   EMAIL_SERVER_PORT="587"
   EMAIL_SERVER_SECURE="false"
   EMAIL_SERVER_USER="your-email@yahoo.com"
   EMAIL_SERVER_PASSWORD="your-app-password"
   EMAIL_FROM="your-email@yahoo.com"
   ```

### Custom SMTP Server

```env
EMAIL_SERVER_HOST="your-smtp-server.com"
EMAIL_SERVER_PORT="587"  # or 465 for SSL
EMAIL_SERVER_SECURE="false"  # "true" for port 465
EMAIL_SERVER_USER="your-username"
EMAIL_SERVER_PASSWORD="your-password"
EMAIL_FROM="noreply@yourdomain.com"
```

## Testing Email Configuration

### 1. Check Configuration Status

Visit the admin panel or use the API endpoint:

```bash
GET /api/email-config
```

This will show you which environment variables are configured.

### 2. Send Test Email

Use the test email endpoint:

```bash
POST /api/test-email
{
  "email": "test@example.com"
}
```

## Email Templates

The system uses HTML email templates with the following features:

- **Professional Design**: Clean, responsive layout
- **Thesis Information**: Student details, thesis title, and description
- **Action Buttons**: Direct links to approval system
- **Advisor Role**: Clearly indicates main advisor vs co-advisor
- **Important Notices**: Highlights that both advisors must approve

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify app password is correct
   - Ensure 2FA is enabled for Gmail
   - Check username/email format

2. **Connection Timeout**
   - Verify SMTP host and port
   - Check firewall settings
   - Try different port (587 vs 465)

3. **TLS/SSL Errors**
   - For port 587: use `EMAIL_SERVER_SECURE="false"`
   - For port 465: use `EMAIL_SERVER_SECURE="true"`

### Debug Logs

Check the server console for detailed email sending logs:

```
[EMAIL SERVICE] Starting thesis creation notifications
[EMAIL SERVICE] Sending email to main advisor: advisor@example.com
[EMAIL SERVICE] Successfully sent email to main advisor
```

### Test Commands

1. **Check email configuration:**
   ```bash
   curl -X GET "http://localhost:3000/api/email-config"
   ```

2. **Send test email:**
   ```bash
   curl -X POST "http://localhost:3000/api/test-email" \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

## Production Considerations

1. **Use Environment Variables**: Never commit email credentials to git
2. **Rate Limiting**: Consider implementing email rate limiting
3. **Queue System**: For high volume, use email queue (Redis/Bull)
4. **Error Handling**: Monitor email failures and retry logic
5. **Unsubscribe**: Add unsubscribe links for compliance

## Security Best Practices

1. **App Passwords**: Use app-specific passwords, not main account passwords
2. **Encryption**: Use TLS for SMTP connections
3. **Validation**: Validate email addresses before sending
4. **Logging**: Log email events without exposing sensitive data
5. **Backup**: Have backup email configuration for reliability

## Features Implemented

- ✅ New thesis proposal notifications
- ✅ HTML email templates
- ✅ Multiple advisor support
- ✅ Error handling and logging
- ✅ Test email functionality
- ✅ Configuration validation

## Next Steps

Consider implementing:
- Email templates for other events (approvals, rejections)
- Email preferences for users
- Email delivery status tracking
- Scheduled email reminders
- Email analytics and reporting 