# 🚀 WhatsApp CRM - Baileys Version

## ✅ Meta API Completely Removed - Now Using Baileys!

Ye project ab **Baileys** use karta hai WhatsApp messages send karne ke liye. **No more Meta API, No more restrictions, No more costs!**

---

## 🎯 Quick Start

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2. Setup Environment Variables

Backend `.env` file already configured hai. Meta API keys commented out hain (not needed).

### 3. Start Backend

```bash
cd backend
npm run dev
```

**Terminal mein QR code dikhega!** 📱

```
📱 QR Code generated! Scan it from frontend or terminal.
[QR CODE ASCII ART]
```

### 4. Start Frontend

```bash
cd frontend
npm run dev
```

Open: `http://localhost:5173`

### 5. Connect WhatsApp

1. Login to CRM
2. Go to **Campaigns** page
3. Top par **"WhatsApp Connection"** card dikhega
4. **QR code scan karo** apne phone se:
   - Open WhatsApp on phone
   - Settings → Linked Devices → Link a Device
   - Scan the QR code
5. **Status "Connected" dikhega** ✅
6. **Ab campaign send karo!** 🎉

---

## 📱 Features

### ✅ What Works

- **Text Messages** - Plain text messages
- **Image Messages** - Images with captions
- **Campaign Management** - Create & track campaigns
- **Contact Management** - Import/manage contacts
- **Real-time Status** - Connection status display
- **Auto-reconnect** - Automatic reconnection on disconnect
- **Session Persistence** - No need to rescan QR after restart

### 🆓 Advantages Over Meta API

| Feature | Meta API | Baileys |
|---------|----------|---------|
| Cost | Paid (per message) | **FREE** |
| Setup | Complex (Business account) | **QR Scan** |
| 24hr Window | Yes (restrictive) | **NO** |
| Templates | Required for cold messages | **Optional** |
| Number Type | Business only | **Any WhatsApp** |
| API Keys | Required | **Not Needed** |
| Rate Limits | Strict | **Flexible** |

---

## 🏗️ Architecture

```
Frontend (React + TypeScript)
    ↓
Backend Express API
    ↓
Baileys Library
    ↓
WhatsApp Web Protocol
    ↓
Your WhatsApp Account
    ↓
Recipients
```

---

## 📂 Project Structure

```
AI_WhatsApp_CRM/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   └── whatsapp.service.js    ← Baileys integration
│   │   ├── controllers/
│   │   │   └── campaign.controller.js  ← Uses Baileys
│   │   ├── routes/
│   │   │   └── whatsapp.routes.js     ← Status & logout endpoints
│   │   └── server.js                   ← Initializes Baileys
│   ├── baileys_auth/                   ← Session storage (gitignored)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── whatsapp/
│   │   │       └── WhatsAppStatus.tsx  ← QR & status display
│   │   └── services/
│   │       └── whatsapp.api.ts         ← API calls
│   └── package.json
│
└── Documentation/
    ├── BAILEYS_SETUP.md                ← Detailed setup guide
    ├── MIGRATION_SUMMARY.md            ← Migration details
    └── README_BAILEYS.md               ← This file
```

---

## 🔧 API Endpoints

### WhatsApp Endpoints

```
GET  /api/v1/whatsapp/status    - Get connection status & QR code
POST /api/v1/whatsapp/logout    - Logout & clear session
```

### Campaign Endpoints (Unchanged)

```
POST /api/v1/campaigns/send     - Send campaign
GET  /api/v1/campaigns          - Get all campaigns
GET  /api/v1/campaigns/:id      - Get campaign by ID
```

### Contact Endpoints (Unchanged)

```
POST /api/v1/contacts           - Create contact
POST /api/v1/contacts/upload    - Upload CSV/Excel
GET  /api/v1/contacts           - Get all contacts
```

---

## 💻 Usage Example

### Send Text Campaign

```javascript
// Frontend
await campaignApi.sendCampaign({
  messageTemplate: "Hello {User}, this is a test message!",
  recipientIds: ["contact_id_1", "contact_id_2"],
});
```

### Send Image Campaign

```javascript
// Frontend
await campaignApi.sendCampaign({
  messageTemplate: "Check out this image, {User}!",
  imageUrl: "https://example.com/image.jpg",
  recipientIds: ["contact_id_1", "contact_id_2"],
});
```

### Backend Processing

```javascript
// Backend automatically handles:
// - Phone number normalization (9876543210 → 919876543210@s.whatsapp.net)
// - Message queuing (5-15 sec delay between messages)
// - Error handling & retry
// - Campaign status updates
```

---

## 🔐 Security & Privacy

### Session Storage

- WhatsApp session stored in `backend/baileys_auth/`
- **Encrypted credentials**
- **Gitignored** (never committed)
- Logout clears all session data

### Data Safety

- No data sent to third parties
- Direct connection to WhatsApp Web
- Same encryption as WhatsApp Web
- Session tied to your WhatsApp account

---

## 🐛 Troubleshooting

### QR Code Not Showing?

**Problem:** Frontend shows "Waiting for connection..."

**Solutions:**
1. Check backend console - QR should be there
2. Restart backend: `npm run dev`
3. Refresh frontend page
4. Check backend logs for errors

### "WhatsApp not connected" Error

**Problem:** Campaign fails with connection error

**Solutions:**
1. Check WhatsApp Connection card status
2. Should show "Connected" (green)
3. If not connected, scan QR code
4. Wait for connection to establish

### Messages Not Sending?

**Problem:** Campaign shows "failed" status

**Solutions:**
1. Verify WhatsApp connection (should be green)
2. Check backend console for specific errors
3. Verify phone numbers are correct format
4. Check your phone has internet connection
5. Make sure you're not blocked by recipient

### Connection Keeps Dropping?

**Problem:** Status shows "Disconnected" frequently

**Solutions:**
1. Check internet connection (backend server)
2. Don't logout from WhatsApp on phone
3. Keep only 1 session active
4. Restart backend if persists

### QR Code Expired?

**Problem:** "QR code expired" message

**Solutions:**
1. Frontend auto-refreshes QR every 3 seconds
2. Generate new QR: Restart backend
3. Scan quickly (QR expires in ~60 seconds)

---

## 📊 Campaign Status

| Status | Meaning | Action Needed |
|--------|---------|---------------|
| `queued` | Campaign created | Wait |
| `sending` | Messages being sent | Wait |
| `completed` | All sent successfully | ✅ None |
| `failed` | Some/all failed | Check errors |

---

## ⚙️ Configuration

### Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://...

# Frontend
CLIENT_URL=http://localhost:5173

# JWT
ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_secret

# Email
MAIL_HOST=smtp.gmail.com
MAIL_USER=your_email
MAIL_PASS=your_password

# Meta API (NOT USED - Commented out)
# META_WHATSAPP_API_URL=...
# META_WHATSAPP_PHONE_NUMBER_ID=...
# META_WHATSAPP_ACCESS_TOKEN=...
```

### Rate Limiting

Messages sent with 5-15 second random delay to prevent ban:

```javascript
const WAIT_MIN_MS = 5000;  // 5 seconds
const WAIT_MAX_MS = 15000; // 15 seconds
```

Adjust in `campaign.controller.js` if needed.

---

## 🔄 Updates & Maintenance

### Update Baileys

```bash
cd backend
npm update @whiskeysockets/baileys
```

### Clear Session

```bash
# Method 1: Use Logout button in UI
# Method 2: Manually delete
rm -rf backend/baileys_auth
```

### View Logs

```bash
# Backend console shows:
📱 QR Code generated!
✅ WhatsApp connected successfully!
📞 Sending to: 919876543210
❌ Failed to send to 919876543210: [error]
```

---

## 📚 Documentation

- **BAILEYS_SETUP.md** - Detailed setup & usage guide
- **MIGRATION_SUMMARY.md** - Meta API → Baileys migration details
- **TROUBLESHOOTING.md** - Common issues & solutions (old, for reference)

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📝 License

This project is for educational purposes. Please comply with WhatsApp's Terms of Service.

---

## ⚠️ Important Notes

### WhatsApp Terms of Service

- Use responsibly
- Don't spam
- Don't send unsolicited messages
- Follow WhatsApp's Terms of Service
- Risk of ban if misused

### Limitations

- Can link only 1 WhatsApp account at a time
- Logout requires re-scanning QR
- Backend restart preserves session (no rescan needed)
- Same rate limits as WhatsApp Web

### Best Practices

- ✅ Send messages only to people who opted in
- ✅ Use delays between messages (already implemented)
- ✅ Don't send spam
- ✅ Keep campaigns reasonable
- ✅ Monitor for errors
- ❌ Don't automate too heavily
- ❌ Don't send to unknown numbers

---

## 🎉 Success Story

### Before (Meta API):

- ❌ Costly (per-message pricing)
- ❌ Complex setup (Business account required)
- ❌ 24-hour messaging window restriction
- ❌ Template approval needed
- ❌ Limited to business numbers

### After (Baileys):

- ✅ **FREE** forever
- ✅ **Simple** QR scan setup
- ✅ **No restrictions** on messaging window
- ✅ **No templates** needed
- ✅ **Any WhatsApp** account works

---

## 🚀 What's Next?

Possible future enhancements:

- [ ] Video message support
- [ ] Document/PDF sending
- [ ] Voice message support
- [ ] Group messaging
- [ ] Message scheduling
- [ ] Analytics dashboard
- [ ] A/B testing campaigns
- [ ] Webhook support

---

## 📧 Support

For issues or questions:

1. Check **BAILEYS_SETUP.md** for detailed guide
2. Check **Troubleshooting** section above
3. Check backend console logs
4. Check Baileys GitHub: https://github.com/WhiskeySockets/Baileys

---

## 🎯 Summary

**✅ Meta API Removed**  
**✅ Baileys Integrated**  
**✅ FREE Forever**  
**✅ No Restrictions**  
**✅ Easy Setup (QR Scan)**  
**✅ Full Features**

**Start sending WhatsApp campaigns for FREE now!** 🚀

```bash
npm run dev  # Backend
npm run dev  # Frontend
# Scan QR → Send Campaign → SUCCESS! 🎉
```

---

Made with ❤️ for WhatsApp CRM automation
