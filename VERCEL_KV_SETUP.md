# Vercel KV Setup Guide

## Quick Setup (5 minutes)

### Step 1: Enable Vercel KV in Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`telegram-cs`)
3. Go to **Storage** tab
4. Click **"Create Database"**
5. Select **"KV"** (Key-Value store)
6. Enter a name (e.g., `telegram-cs-kv`)
7. Select a region (choose closest to you)
8. Click **"Create"**

### Step 2: Environment Variables (Auto-added)

Vercel automatically adds these environment variables:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

**No manual setup needed!** They're automatically available in your functions.

### Step 3: Deploy

The code is already migrated! Just:

1. **Push to GitHub** (if not already done)
2. **Vercel will auto-deploy**
3. **Or manually redeploy** from Vercel Dashboard

### Step 4: Test

1. Visit your deployed app
2. Call `/api/seed` to generate sample data
3. Check that data persists across requests
4. Verify no more inconsistent data issues!

## Local Development

For local development, you have two options:

### Option A: Use Vercel KV (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Link your project: `vercel link`
3. Pull environment variables: `vercel env pull .env.local`
4. Run dev server: `npm run dev`

### Option B: Fallback to In-Memory (Development Only)

If you don't have Vercel KV set up locally, the code will work but you'll see errors. For local testing without KV, you can temporarily use the old in-memory store.

## Verification

After deployment, verify it's working:

1. **Check Vercel Dashboard → Storage**
   - You should see your KV database
   - Check the "Usage" tab to see operations

2. **Test API Endpoints**
   ```bash
   # Generate sample data
   curl https://your-app.vercel.app/api/seed
   
   # Get conversations (should be consistent now)
   curl https://your-app.vercel.app/api/messages
   ```

3. **Check Logs**
   - Go to Vercel Dashboard → Your Project → Functions
   - Check for any KV-related errors
   - Should see successful operations

## Troubleshooting

### Error: "KV client is not configured"

**Solution:**
- Make sure Vercel KV is created in the dashboard
- Verify environment variables are set (they're auto-added)
- Redeploy after creating KV database

### Error: "Invalid KV REST API URL"

**Solution:**
- Check that `KV_REST_API_URL` is set in environment variables
- Make sure you're using the correct Vercel project
- Try redeploying

### Data Not Persisting

**Solution:**
- Verify KV database is created and active
- Check Vercel Dashboard → Storage → Your KV → Usage
- Make sure you're calling the deployed version, not local

### Local Development Issues

**Solution:**
- Use `vercel env pull` to get KV credentials locally
- Or use the Vercel CLI: `vercel dev` (runs with full Vercel environment)

## Data Structure in KV

The migration uses these Redis data structures:

```
messages:{chatId}          → List of JSON strings (messages)
conversations              → Set of chat IDs
conversation:{chatId}      → Hash with metadata (userId, username, lastActivity)
```

## Cost

**Free Tier:**
- 30,000 reads/day
- 1,000 writes/day
- Perfect for demo/testing

**Paid Plans:**
- Starts at $0.20/GB storage
- $0.20 per million requests
- Very affordable for production

## Next Steps

✅ **Migration Complete!**

Your app now:
- ✅ Uses Vercel KV instead of in-memory storage
- ✅ Works consistently across serverless instances
- ✅ Persists data between deployments
- ✅ No more inconsistent data issues!

Enjoy your production-ready demo! 🎉

