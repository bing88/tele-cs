# Vercel Environment Variables Setup Guide

## Quick Fix for "OPENAI_API_KEY is not set" Error

If you're seeing this error, follow these steps:

### Step 1: Verify Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`tele-cs`)
3. Go to **Settings** → **Environment Variables**

### Step 2: Check Each Variable

Make sure you have these **exact** variable names:

- ✅ `OPENAI_API_KEY` (not `OPENAI_KEY` or `OPENAI_API`)
- ✅ `TELEGRAM_BOT_TOKEN` (not `TELEGRAM_TOKEN`)
- ✅ `TELEGRAM_WEBHOOK_SECRET` (optional but recommended)
- ✅ `TELEGRAM_WEBHOOK_URL` (should be `https://tele-cs.vercel.app/api/webhook`)
- ✅ `NEXT_PUBLIC_APP_URL` (should be `https://tele-cs.vercel.app`)

### Step 3: Check Environment Scope

**CRITICAL**: For each variable, make sure it's enabled for **Production**:

1. Click on each variable
2. Check the "Environment" checkboxes:
   - ✅ Production
   - ✅ Preview (optional)
   - ✅ Development (optional)

### Step 4: Redeploy (REQUIRED!)

**Environment variables only take effect after redeploy:**

#### Option A: Redeploy via Dashboard
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **"..."** menu (three dots)
4. Select **"Redeploy"**
5. Wait for deployment to complete

#### Option B: Trigger Redeploy via Git
```bash
# Make a small change and push
git commit --allow-empty -m "Trigger redeploy for env vars"
git push
```

### Step 5: Verify After Redeploy

1. Go to **Deployments** → Latest deployment
2. Click on the deployment
3. Go to **Functions** tab
4. Check the logs for any errors
5. Try your API call again

## Common Issues

### Issue: "OPENAI_API_KEY is not set" after setting it

**Solution:**
- ✅ Variable name must be exactly `OPENAI_API_KEY` (case-sensitive)
- ✅ Must be enabled for "Production" environment
- ✅ Must redeploy after adding/changing variables
- ✅ Check for typos or extra spaces in variable name

### Issue: Variables work locally but not on Vercel

**Solution:**
- Local `.env.local` is different from Vercel environment variables
- Variables must be set separately in Vercel dashboard
- Vercel doesn't read `.env.local` files

### Issue: Variables work in Preview but not Production

**Solution:**
- Check environment scope when adding variables
- Make sure "Production" checkbox is checked
- Redeploy production deployment

## Testing Environment Variables

After redeploy, you can test if variables are set by checking the function logs:

1. Go to Vercel Dashboard → Your Project
2. Go to **Functions** tab
3. Click on a function (e.g., `/api/messages/[chatId]/reply`)
4. Check the logs for any "is not set" errors

## Still Not Working?

1. **Double-check variable names** - They must match exactly
2. **Verify environment scope** - Production must be checked
3. **Redeploy** - This is required after any changes
4. **Check deployment logs** - Look for specific error messages
5. **Try deleting and re-adding** the variable

## Quick Checklist

- [ ] Variable name is exactly `OPENAI_API_KEY` (case-sensitive)
- [ ] Variable is enabled for "Production" environment
- [ ] Redeployed after adding/changing variable
- [ ] Checked deployment logs for errors
- [ ] No typos or extra spaces in variable name or value

