# White Screen Fix - Inbox

## Issue: White Screen

White screen aa rahi hai matlab React mein error hai jo render ko block kar raha hai.

## Quick Fix Applied:

1. **Temporary Simple Inbox** created: `InboxSimple.tsx`
2. **App.tsx updated** to use simple version
3. **Types fixed** in Inbox import

## To Debug:

### Step 1: Open Browser Console
```
Press F12 → Console tab
Check for red errors
```

### Step 2: Check Common Errors

#### Error 1: "Cannot find module"
**Solution:** Import path wrong hai
```typescript
// Wrong:
import Inbox from "./pages/Dashboard/Inbox";

// Right:
import InboxSimple from "./pages/Dashboard/InboxSimple";
```

#### Error 2: "X is not exported"
**Solution:** Type import wrong hai
```typescript
// Wrong:
import { whatsappApi, Chat, Message } from "...";

// Right:
import { whatsappApi } from "...";
import type { Chat, Message } from "...";
```

#### Error 3: "useQuery is not a function"
**Solution:** @tanstack/react-query not installed properly

### Step 3: Restart Frontend

```bash
# Stop frontend (Ctrl+C in terminal)
cd frontend
npm install
npm run dev
```

### Step 4: Test Simple Version

```
1. Open: http://localhost:5173/dashboard/inbox
2. Should show "Coming Soon!" message
3. If this works, complex Inbox has bug
```

## Current Status:

✅ Simple Inbox active (should work)  
⏳ Complex Inbox debugging needed  
✅ Backend inbox APIs ready  
✅ Sidebar link added  

## Next Steps:

1. **Check browser console** for exact error
2. **Take screenshot** of error
3. **Share error message** - I'll fix it

## Temporary Workaround:

Use Sidebar → Inbox  
Will show placeholder "Coming Soon"  
Once error is known, full Inbox will be enabled

## Common Fixes:

### Fix 1: Clear Cache
```
Ctrl + Shift + R (hard refresh)
or
Ctrl + Shift + Delete → Clear cache
```

### Fix 2: Restart Dev Server
```bash
# Terminal where frontend is running
Ctrl + C
npm run dev
```

### Fix 3: Reinstall Dependencies
```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

## Error Messages to Check:

Look for these in console:
- ❌ "Failed to compile"
- ❌ "Module not found"
- ❌ "Cannot read property"
- ❌ "is not a function"
- ❌ "Unexpected token"

Share the exact error and I'll fix it immediately!
