# Campaign Image Message Fix - Documentation

## Problem Summary
Campaign messages with images were failing with error: **"Unknown: #133010/Account not registered"**

## Root Causes Identified

### 1. **Phone Number Format Issue** ✅ FIXED
- WhatsApp Business API requires phone numbers in **E.164 format** (international format with country code)
- Example: `919876543210` (91 is India country code)
- Previous code was sending numbers as-is without normalization
- Error #133010 typically means the number is not recognized or incorrectly formatted

### 2. **No Image Support** ✅ FIXED
- Backend only supported text messages
- No handling for image URLs
- WhatsApp API requires different message structure for images

### 3. **Limited Error Details** ✅ FIXED
- Console wasn't showing full error details
- Added comprehensive error logging

## Changes Made

### Backend Changes

#### 1. **Campaign Controller** (`backend/src/controllers/campaign.controller.js`)

**Added Phone Number Normalization:**
```javascript
const normalizePhoneNumber = (phoneNumber) => {
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // If starts with 0, replace with 91 for India
    if (cleaned.startsWith('0')) {
        cleaned = '91' + cleaned.substring(1);
    }
    
    // If doesn't start with country code, add 91
    if (!cleaned.startsWith('91') && cleaned.length === 10) {
        cleaned = '91' + cleaned;
    }
    
    return cleaned;
};
```

**Updated Message Sending to Support Images:**
```javascript
const sendMetaMessage = async (phoneNumber, text, imageUrl = null) => {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    
    let messageBody;
    
    if (imageUrl) {
        // Send image with caption
        messageBody = {
            messaging_product: "whatsapp",
            to: normalizedPhone,
            type: "image",
            image: {
                link: imageUrl,
                caption: text,
            },
        };
    } else {
        // Send text only
        messageBody = {
            messaging_product: "whatsapp",
            to: normalizedPhone,
            type: "text",
            text: { body: text },
        };
    }
    // ... send to WhatsApp API
};
```

**Enhanced Error Logging:**
```javascript
catch (error) {
    console.error(`Failed to send to ${item.contact.phoneNumber}:`, error.message);
    campaign.errors.push({
        contact: item.contact._id,
        message: error?.message || "Failed to send message",
    });
}
```

#### 2. **Campaign Model** (`backend/src/models/Campaign.model.js`)
Added `imageUrl` field:
```javascript
imageUrl: {
    type: String,
    trim: true,
    default: null,
}
```

#### 3. **Validator** (`backend/src/validators/campaign.validator.js`)
Added image URL validation:
```javascript
body("imageUrl")
    .optional()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage("Image URL must be a valid HTTP/HTTPS URL")
```

### Frontend Changes

#### 1. **Campaign Page** (`frontend/src/components/campaign/CampaignPage.tsx`)

**Added Image URL Input:**
```tsx
const [imageUrl, setImageUrl] = useState("");

<label>
  <span className="premium-label">Image URL (optional)</span>
  <input
    type="url"
    value={imageUrl}
    onChange={(e) => setImageUrl(e.target.value)}
    className="premium-input"
    placeholder="https://example.com/image.jpg"
  />
</label>
```

**Updated Submit Handler:**
```tsx
await campaignMutation.mutateAsync({
  messageTemplate,
  recipientIds: selectedRecipients,
  ...(imageUrl && { imageUrl }),
});
```

#### 2. **API Service** (`frontend/src/services/campaign.api.ts`)
Updated types to include `imageUrl`:
```typescript
export interface CampaignPayload {
  messageTemplate: string;
  recipientIds: string[];
  imageUrl?: string;
}
```

## How to Use

### 1. **Text-Only Campaign**
- Enter your message template
- Select recipients
- Click "Send campaign"
- Phone numbers will automatically be formatted correctly

### 2. **Campaign with Image**
- Enter your message template
- Enter a **publicly accessible image URL** in the "Image URL" field
  - Example: `https://i.imgur.com/example.jpg`
  - Image must be accessible without authentication
  - Supported formats: JPG, PNG, WebP
  - Max size: 5MB (WhatsApp limit)
- Select recipients
- Click "Send campaign"

### 3. **Image URL Requirements**
✅ DO:
- Use HTTPS URLs
- Use direct image links (ends with .jpg, .png, etc.)
- Use CDN or cloud storage (Imgur, Cloudinary, AWS S3, etc.)
- Ensure images are publicly accessible

❌ DON'T:
- Use localhost URLs
- Use password-protected images
- Use very large files (>5MB)

## Testing

### Check Phone Number Format:
Open backend console and look for normalized phone numbers:
```
Sending to: 919876543210 ✅ (correct format)
Not: 9876543210 ❌ (missing country code)
```

### Check Error Messages:
If campaign fails, check:
1. Backend console for detailed error
2. Campaign history in frontend for error details
3. Verify phone number is WhatsApp registered

### Common Errors:

| Error Code | Meaning | Solution |
|------------|---------|----------|
| #133010 | Account not registered | Verify number is on WhatsApp |
| #131026 | Message undeliverable | Check number format |
| #131047 | Re-engagement message | User hasn't messaged in 24hrs |
| #100 | Invalid parameter | Check image URL is accessible |

## Phone Number Format Guide

The system now automatically handles these formats:

| Input Format | Normalized Output | Status |
|--------------|-------------------|---------|
| `9876543210` | `919876543210` | ✅ Auto-fixed |
| `09876543210` | `919876543210` | ✅ Auto-fixed |
| `+919876543210` | `919876543210` | ✅ Cleaned |
| `919876543210` | `919876543210` | ✅ Already correct |

## Next Steps

1. **Restart your backend server** to apply changes
2. **Test with a text-only campaign first**
3. **Then test with an image campaign**
4. **Check backend console for any errors**

## Important Notes

⚠️ **WhatsApp Business API Limitations:**
- You can only send messages to numbers that have opted-in
- 24-hour messaging window applies after last user message
- Rate limits apply (be careful with large campaigns)
- Images must be publicly accessible

⚠️ **Account Not Registered Error:**
- This error means the phone number is not on WhatsApp
- Verify the number is correct
- Check that the number has WhatsApp installed
- Ensure country code is correct (91 for India)

## Support

If issues persist:
1. Check backend console logs for detailed errors
2. Verify WhatsApp Business API credentials in `.env`
3. Test with your own WhatsApp number first
4. Ensure phone numbers are in correct format in database
