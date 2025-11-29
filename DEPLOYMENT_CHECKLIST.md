# 🎯 TenderLert Backend Deployment Checklist

## ✅ Completed Steps

- [x] Created complete backend folder structure
- [x] Installed all production dependencies (drizzle-orm, @vercel/postgres, jsonwebtoken, bcryptjs)
- [x] Installed development dependencies (drizzle-kit)
- [x] Created all API route handlers (5 endpoints)
- [x] Created all utility libraries (4 files)
- [x] Created database schemas (2 tables)
- [x] Configured Vercel serverless functions
- [x] Configured Drizzle ORM

## 📋 Next Steps (Action Required)

### 1. Set Up Supabase Database
- [ ] Go to [Supabase](https://supabase.com)
- [ ] Create a new project (or use existing)
- [ ] Navigate to Settings → Database
- [ ] Copy the **Connection String** (URI format)
- [ ] Save it for the next step

### 2. Generate JWT Secret
- [ ] Run this command in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
- [ ] Copy the generated string

### 3. Add Environment Variables to Vercel
- [ ] Go to [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] Select your TenderLert project
- [ ] Go to Settings → Environment Variables
- [ ] Add these two variables:

**Variable 1:**
```
Name: DATABASE_URL
Value: <your_supabase_connection_string>
Environment: Production, Preview, Development (select all)
```

**Variable 2:**
```
Name: JWT_SECRET
Value: <your_generated_secret_from_step_2>
Environment: Production, Preview, Development (select all)
```

### 4. Push Database Schema
- [ ] Run this command to create tables in your database:
```bash
npx drizzle-kit push
```
- [ ] Confirm when prompted
- [ ] Verify tables were created in Supabase dashboard

### 5. Deploy to Vercel
- [ ] Stage all changes:
```bash
git add .
```

- [ ] Commit changes:
```bash
git commit -m "Add complete backend with auth and contact API"
```

- [ ] Push to GitHub:
```bash
git push
```

- [ ] Wait for Vercel to auto-deploy (check Vercel dashboard)

### 6. Test Your API Endpoints
After deployment, test these endpoints using Postman or curl:

- [ ] Test registration: `POST https://your-domain.vercel.app/api/auth/register`
- [ ] Test login: `POST https://your-domain.vercel.app/api/auth/login`
- [ ] Test contact form: `POST https://your-domain.vercel.app/api/contact`

### 7. Update Frontend API URLs
- [ ] Update your frontend code to use the deployed API URLs
- [ ] Replace any localhost URLs with your Vercel domain

## 🔍 Troubleshooting

### If deployment fails:
1. Check Vercel deployment logs
2. Verify environment variables are set correctly
3. Ensure DATABASE_URL is in the correct format
4. Check that all dependencies are in package.json

### If API returns errors:
1. Check Vercel function logs
2. Verify database connection string
3. Ensure tables exist in Supabase
4. Check JWT_SECRET is set

## 📞 API Endpoints Reference

### Authentication
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me (requires Bearer token)
POST /api/auth/logout
```

### Contact
```
POST /api/contact
```

## 🎉 When Complete

Once all checkboxes are checked, your backend will be:
- ✅ Fully deployed on Vercel
- ✅ Connected to Supabase database
- ✅ Secured with JWT authentication
- ✅ Ready for production use

---

**Need help?** Check `BACKEND_README.md` for detailed documentation.
