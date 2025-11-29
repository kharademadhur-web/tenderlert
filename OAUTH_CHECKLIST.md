# ✅ Google OAuth Implementation Checklist

## 🚀 Deployment Steps

### 1. Database Migration
Run this command locally to update your Supabase database with the new `googleId` and `avatarUrl` columns:
```bash
npx drizzle-kit push
```

### 2. Environment Variables (Vercel)
Ensure these variables are added to your Vercel Project Settings:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI` (Value: `https://tenderlert.vercel.app/api/auth/google/callback`)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` (Required for Supabase client if used, though we used Drizzle for DB operations)
- `JWT_SECRET`

### 3. Deploy
Push your changes to GitHub:
```bash
git add .
git commit -m "Implement Google OAuth 2.0"
git push
```

## 🧪 Testing
1. Go to your deployed app: `https://tenderlert.vercel.app/login`
2. Click "Continue with Google"
3. You should be redirected to Google, then back to the dashboard
4. Check Supabase `users` table to see the new user with `googleId`

## 🔍 Troubleshooting
- **500 Error on Redirect**: Check `GOOGLE_CLIENT_ID` and `GOOGLE_REDIRECT_URI` env vars.
- **403 State Mismatch**: Ensure cookies are working (browser settings) and `GOOGLE_REDIRECT_URI` matches exactly in Google Cloud Console and Vercel.
- **Database Error**: Ensure you ran `npx drizzle-kit push`.
