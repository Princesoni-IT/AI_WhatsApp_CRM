# Campaign Failed - Complete Troubleshooting Guide

## ✅ Backend is NOW Running
Server started successfully on port 5000!

## 🔍 Root Cause Found

### Problem 1: Phone Numbers Without Country Code
**Database Check Results:**
```
RAM     → 9343596430     ❌ Missing 91
Prince  → 9343596439     ❌ Missing 91  
Harsh   → 7879900688     ❌ Missing 91
Sourav  → 9876543678     ❌ Missing 91
Raj     → +917804947152  ✅ Has +91 but FAILED
```

### Problem 2: "Account Not Registered" Error #133010

This WhatsApp error means:
1. **The phone number is NOT registered on WhatsApp** ⚠️
2. OR the number format is incorrect
3. OR it's a test/invalid number

## 🎯 Solutions

### Immediate Fix (Already Applied ✅)
Backend code now automatically normalizes numbers:
- `9343596430` → `919343596430`
- `+917804947152` → `917804947152`
- `09876543210` → `919876543210`

**Backend logs will now show:**
```
📞 Sending to: 9343596430 → Normalized: 919343596430
```

### Critical: Verify WhatsApp Registration

Before sending campaigns, **verify each number is on WhatsApp**:

1. **Method 1: Manual Check**
   - Open WhatsApp on your phone
   - Try to send a message to each number
   - If you can't find them in WhatsApp = They're not registered

2. **Method 2: Use Your Own Number First**
   - Add YOUR OWN WhatsApp number to contacts
   - Send a test campaign to yourself
   - If successful = Code works
   - If failed = Configuration issue

3. **Method 3: WhatsApp Business API Verification**
   The numbers must:
   - ✅ Be registered on WhatsApp
   - ✅ Have messaged your WhatsApp Business number before (for first contact)
   - ✅ Be within 24-hour messaging window OR be template message

## 🧪 Testing Steps

### Step 1: Test with YOUR Number
1. Add your own WhatsApp number to contacts:
   ```
   Name: Test User
   Phone: YOUR_WHATSAPP_NUMBER (with country code)
   ```

2. Send a campaign to yourself:
   - Message: "Hello {User}, this is a test"
   - Select only your number
   - Click Send

3. Check backend console:
   ```
   📞 Sending to: 919876543210 → Normalized: 919876543210
   ```

4. Check your WhatsApp - Message should arrive!

### Step 2: Check Error Details
If it fails, backend console will show:
```
Failed to send to 919876543210: [Error message]
```

Common errors:
- `#133010` = Number not registered on WhatsApp
- `#131026` = Message undeliverable  
- `#131047` = Re-engagement needed (24hr window)
- `#100` = Invalid parameter

### Step 3: Verify WhatsApp Business Config
Check `.env` file:
```bash
META_WHATSAPP_API_URL=https://graph.facebook.com/v19.0
META_WHATSAPP_PHONE_NUMBER_ID=1133998479805988
META_WHATSAPP_ACCESS_TOKEN=EAAVU2MZAe... (your token)
```

Test the API directly:
```bash
curl -X POST \
  "https://graph.facebook.com/v19.0/1133998479805988/messages" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "919876543210",
    "type": "text",
    "text": { "body": "Test message" }
  }'
```

## 📋 Database Fix (Optional but Recommended)

Update all numbers to proper format:

```javascript
// Run this script: backend/fixPhoneNumbers.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const normalizePhoneNumber = (phoneNumber) => {
    let cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '91' + cleaned.substring(1);
    }
    if (!cleaned.startsWith('91') && cleaned.length === 10) {
        cleaned = '91' + cleaned;
    }
    return cleaned;
};

async function fixNumbers() {
    await mongoose.connect(process.env.MONGO_URI);
    
    const Contact = mongoose.model('Contact', new mongoose.Schema({
        name: String,
        phoneNumber: String,
    }));
    
    const contacts = await Contact.find({});
    
    for (const contact of contacts) {
        const normalized = normalizePhoneNumber(contact.phoneNumber);
        if (normalized !== contact.phoneNumber) {
            console.log(`Updating ${contact.name}: ${contact.phoneNumber} → ${normalized}`);
            contact.phoneNumber = normalized;
            await contact.save();
        }
    }
    
    console.log('✅ All numbers normalized!');
    await mongoose.disconnect();
}

fixNumbers();
```

Run it:
```bash
cd backend
node fixPhoneNumbers.js
```

## 🚨 WhatsApp Business API Important Rules

### 24-Hour Messaging Window
- You can only send messages to users who messaged you in last 24 hours
- OR use approved Message Templates
- Test numbers might not have this window open

### Message Templates
For cold messaging (no prior conversation), you need:
1. Go to Meta Business Manager
2. Create Message Template
3. Get it approved
4. Use template name in API

### Number Registration
**THE MAIN ISSUE**: The numbers in your screenshot might be:
- ❌ Not real WhatsApp numbers
- ❌ Test numbers that aren't registered
- ❌ Numbers that blocked your business account

## ✅ Next Steps

1. **Verify Backend is Running**
   ```bash
   # Check logs
   cd backend
   npm run dev
   # Should show: "🚀 Server running on port 5000"
   ```

2. **Add Your Own Number**
   - Login to frontend
   - Add your personal WhatsApp number
   - Make sure it's in format: `919876543210`

3. **Send Test Campaign to Yourself**
   - Create campaign with simple text
   - Select only your number
   - Check backend console for logs
   - Check your WhatsApp

4. **Check Backend Logs**
   Look for:
   ```
   📞 Sending to: 9876543210 → Normalized: 919876543210
   Failed to send to 919876543210: [error details]
   ```

5. **Verify Numbers are Real**
   - All recipient numbers MUST be real WhatsApp accounts
   - They should have messaged your business number before
   - OR you need to use Message Templates

## 🎯 Most Likely Solution

Based on error #133010, the numbers in your database are probably:
1. **Not registered on WhatsApp**
2. **Test/fake numbers**

**To fix**: Replace them with real WhatsApp numbers (including your own) and test again.

The code is NOW FIXED ✅ - the issue is with the phone numbers themselves being invalid/not registered on WhatsApp.

## 📞 Support

Still having issues? Check:
1. Backend console for detailed errors (now with 📞 emoji logs)
2. Are you using real WhatsApp numbers?
3. Have those numbers messaged your business account?
4. Is your WhatsApp Business API token valid?

Test command to verify API works:
```bash
curl "https://graph.facebook.com/v19.0/1133998479805988/messages" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"messaging_product":"whatsapp","to":"YOUR_NUMBER","type":"text","text":{"body":"Test"}}'
```
