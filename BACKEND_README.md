# TenderLert Backend - Complete Setup Guide

## 🎉 Backend Structure Created Successfully!

Your backend is now fully set up with the following structure:

```
api/
  auth/
    ✅ register.ts    - User registration
    ✅ login.ts       - User authentication
    ✅ me.ts          - Get current user
    ✅ logout.ts      - Logout endpoint
  contact/
    ✅ index.ts       - Contact form submission

lib/
  ✅ db.ts           - Database connection
  ✅ auth.ts         - JWT utilities
  ✅ hash.ts         - Password hashing
  ✅ response.ts     - API response helpers

schema/
  ✅ users.ts        - Users table schema
  ✅ contacts.ts     - Contacts table schema

✅ drizzle.config.ts - Drizzle ORM configuration
✅ vercel.json       - Vercel deployment config
```

## 📦 Dependencies Installed

✅ **Production:**
- drizzle-orm
- @vercel/postgres
- jsonwebtoken
- bcryptjs

✅ **Development:**
- drizzle-kit

## 🚀 Next Steps

### 1. Set Up Environment Variables on Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these two variables:

```
DATABASE_URL=your_supabase_postgres_connection_string
JWT_SECRET=your_random_secret_key_here
```

**How to get DATABASE_URL:**
1. Go to your Supabase project
2. Navigate to **Settings → Database**
3. Copy the **Connection String** (URI format)
4. Replace `[YOUR-PASSWORD]` with your actual database password

**How to generate JWT_SECRET:**
Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Push Database Schema

Run this command to create the tables in your database:

```bash
npx drizzle-kit push
```

This will create the `users` and `contacts` tables in your Supabase database.

### 3. Deploy to Vercel

Simply push your code to GitHub:

```bash
git add .
git commit -m "Add backend API routes"
git push
```

Vercel will automatically detect the `/api` folder and deploy your serverless functions!

## 🔌 API Endpoints

Once deployed, your frontend can call these endpoints:

### Authentication
- **POST** `/api/auth/register` - Register new user
  ```json
  {
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```

- **POST** `/api/auth/login` - Login user
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```
  Returns: `{ "success": true, "data": { "token": "jwt_token_here" } }`

- **GET** `/api/auth/me` - Get current user (requires Authorization header)
  ```
  Headers: Authorization: Bearer <token>
  ```

- **POST** `/api/auth/logout` - Logout user

### Contact Form
- **POST** `/api/contact` - Submit contact form
  ```json
  {
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "message": "Hello, I have a question..."
  }
  ```

## 🔒 Security Features

✅ Password hashing with bcryptjs (10 rounds)
✅ JWT authentication with 7-day expiration
✅ Email uniqueness validation
✅ Protected routes with token verification
✅ Secure environment variable handling

## 🛠️ Development

To test locally, you'll need to:

1. Create a `.env` file (copy from `.env.example`)
2. Add your actual DATABASE_URL and JWT_SECRET
3. Run: `npm run dev`

## 📝 Notes

- All API routes use TypeScript
- Responses follow a consistent format: `{ success: boolean, data/message: any }`
- Error handling is built into every endpoint
- Database queries use Drizzle ORM for type safety

## ✅ You're All Set!

Your backend is production-ready and will work seamlessly with Vercel's serverless infrastructure!
