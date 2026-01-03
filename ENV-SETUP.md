# Environment Variables Setup Guide

## Required Environment Variables

To fix the Google OAuth redirect issue in production, you need to set the `NEXT_PUBLIC_SITE_URL` environment variable.

### For Local Development

Add to your `.env.local` file:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### For Production Deployment

Set the environment variable in your hosting platform:

#### Vercel
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   - **Name**: `NEXT_PUBLIC_SITE_URL`
   - **Value**: `https://your-domain.com` (your actual deployed URL)
   - **Environment**: Production (and Preview if needed)

#### Netlify
1. Go to Site settings → Environment variables
2. Add:
   - **Key**: `NEXT_PUBLIC_SITE_URL`
   - **Value**: `https://your-domain.com`
   - **Scopes**: Production, Deploy previews

#### Other Platforms
Set the environment variable according to your platform's documentation.

### Supabase Configuration

Also make sure your Supabase project has the correct redirect URLs:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your production URL to "Redirect URLs":
   - `https://your-domain.com/auth/callback`
   - `http://localhost:3000/auth/callback` (for local development)

### Important Notes

- The `NEXT_PUBLIC_SITE_URL` must match your actual deployed domain
- Include the protocol (`https://` or `http://`)
- Don't include a trailing slash
- After setting the variable, redeploy your application








