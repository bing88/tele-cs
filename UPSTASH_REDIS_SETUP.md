# Upstash Redis Setup Guide

## Why Upstash Redis?

Vercel KV has been deprecated. **Upstash Redis** is the best alternative:
- ✅ Serverless Redis (pay-as-you-go)
- ✅ Free tier (10K commands/day, 256 MB storage)
- ✅ Works seamlessly with Vercel
- ✅ Low latency, global distribution
- ✅ Same Redis API we're already using

## Quick Setup (5 minutes)

### Step 1: Create Upstash Redis Database

1. Go to [Upstash Console](https://console.upstash.com/)
2. Sign up or log in (free account)
3. Click **"Create Database"**
4. Choose:
   - **Type**: Regional (faster) or Global (lower latency)
   - **Name**: `telegram-cs-redis` (or any name)
   - **Region**: Choose closest to you
5. Click **"Create"**

### Step 2: Get Credentials

After creating the database:

1. Click on your database
2. Go to **"REST API"** tab
3. Copy:
   - **UPSTASH_REDIS_REST_URL**
   - **UPSTASH_REDIS_REST_TOKEN**

### Step 3: Add to Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`telegram-cs`)
3. Go to **Settings** → **Environment Variables**
4. Add these two variables:

   ```
   Name: UPSTASH_REDIS_REST_URL
   Value: (paste from Upstash console)
   Environment: Production, Preview, Development (select all)
   
   Name: UPSTASH_REDIS_REST_TOKEN
   Value: (paste from Upstash console)
   Environment: Production, Preview, Development (select all)
   ```

5. **Redeploy** after adding variables

### Step 4: Local Development

For local development, create `.env.local`:

```env
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

Or use Vercel CLI to pull env vars:

```bash
npm i -g vercel
vercel link
vercel env pull .env.local
```

## Verification

After deployment, test it:

1. **Visit your app**: `https://your-app.vercel.app`
2. **Generate sample data**: Visit `/api/seed`
3. **Check conversations**: Visit `/api/messages`
4. **Verify data persists** across requests

## Cost

### Free Tier
- ✅ 10,000 commands/day
- ✅ 256 MB storage
- ✅ Perfect for demo/testing

### Paid Plans
- Starts at $0.20/GB storage
- $0.20 per 100K commands
- Very affordable for production

## Troubleshooting

### Error: "The 'url' property is missing"

**Solution:**
- Make sure `UPSTASH_REDIS_REST_URL` is set in Vercel
- Check environment scope (Production, Preview, Development)
- Redeploy after adding variables

### Error: "The 'token' property is missing"

**Solution:**
- Make sure `UPSTASH_REDIS_REST_TOKEN` is set in Vercel
- Verify token is correct (no extra spaces)
- Redeploy after adding variables

### Data Not Persisting

**Solution:**
- Verify database is active in Upstash console
- Check Upstash console → Database → Metrics
- Make sure you're using the deployed version, not local

### Local Development Issues

**Solution:**
- Create `.env.local` with Upstash credentials
- Or use `vercel env pull .env.local`
- Restart dev server after adding env vars

## Migration from Vercel KV

If you were using Vercel KV before:

1. ✅ Code is already migrated (uses Upstash Redis now)
2. ⚠️ You need to:
   - Create Upstash Redis database
   - Add environment variables to Vercel
   - Redeploy

**No code changes needed!** The API is compatible.

## Next Steps

✅ **Migration Complete!**

Your app now:
- ✅ Uses Upstash Redis instead of deprecated Vercel KV
- ✅ Works consistently across serverless instances
- ✅ Persists data between deployments
- ✅ Free tier for demo/testing

Enjoy your production-ready demo! 🎉

