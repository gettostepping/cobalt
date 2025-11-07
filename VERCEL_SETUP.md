# Vercel Deployment Setup for Cobalt Web

## The Problem

When deployed on Vercel, you're seeing "couldn't connect to the processing instance" because:
1. The `WEB_DEFAULT_API` environment variable is not set
2. Without it, the frontend doesn't know where to connect to the Cobalt API
3. Static sites on Vercel don't show runtime logs (all code runs client-side in the browser)

## Solution: Set Environment Variables in Vercel

### Required Environment Variable

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add the following variable:

   - **Name:** `WEB_DEFAULT_API`
   - **Value:** Your Cobalt API URL
     - Public API: `https://api.cobalt.tools`
     - Your own instance: `https://your-cobalt-api-domain.com`
     - Localhost (for testing): `http://localhost:9000`
   - **Environments:** Production, Preview, Development (select all)

4. **Important:** After adding the variable, you MUST redeploy your project for changes to take effect.

### Optional Environment Variables

- **WEB_HOST** - Your domain (e.g., `cobalt.tools`) - used for meta tags
- **WEB_PLAUSIBLE_HOST** - Plausible analytics hostname (if using analytics)

## Why No Runtime Logs on Vercel?

The Cobalt web frontend is a **static site** (built with SvelteKit + adapter-static). This means:

- ❌ **No server-side code** - Everything runs in the browser
- ❌ **No Vercel Function logs** - There are no serverless functions
- ✅ **Browser console logs** - All logs appear in the browser's developer console

### How to See Logs

1. **Open your deployed site**
2. **Open Browser Developer Tools:**
   - Chrome/Edge: `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Firefox: `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Safari: `Cmd+Option+I` (Mac, need to enable Developer menu first)
3. **Go to the Console tab** - All JavaScript logs will appear here
4. **Check the Network tab** - See all API requests and responses

## Testing After Setup

1. After setting `WEB_DEFAULT_API` and redeploying:
2. Open your site in a browser
3. Open Developer Tools (F12)
4. Go to Console tab
5. Try to process a URL
6. Check for:
   - API requests in Network tab
   - Any errors in Console tab
   - Whether the connection succeeds

## Common Issues

### Issue: Still showing "unreachable" error
**Solution:** 
- Verify `WEB_DEFAULT_API` is set correctly in Vercel
- Make sure you redeployed after adding the variable
- Check that your Cobalt API is accessible (try opening the URL in a browser)
- Check browser console for CORS errors

### Issue: CORS errors in browser console
**Solution:**
- Your Cobalt API needs to allow CORS from your Vercel domain
- Set `CORS_WILDCARD=1` in your Cobalt API environment variables
- Or set `CORS_URL=https://your-vercel-domain.vercel.app` in your Cobalt API

### Issue: Can't see any logs
**Solution:**
- Logs are in the browser console, not Vercel dashboard
- Open Developer Tools (F12) → Console tab
- Make sure you're not filtering out console messages

## Example Configuration

```env
# In Vercel Environment Variables:
WEB_DEFAULT_API=https://api.cobalt.tools
WEB_HOST=your-domain.com
```

```env
# In your Cobalt API .env (if self-hosting):
API_URL=https://api.yourdomain.com
CORS_WILDCARD=1
# OR specify your Vercel domain:
CORS_URL=https://your-app.vercel.app
```

