# 🚀 Quick Deployment Script for Google OAuth

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Google OAuth Deployment Helper" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if .env file exists
Write-Host "Step 1: Checking environment setup..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "📝 Please edit .env file with your actual credentials" -ForegroundColor Cyan
    Write-Host "   Required variables:" -ForegroundColor Cyan
    Write-Host "   - DATABASE_URL" -ForegroundColor White
    Write-Host "   - JWT_SECRET" -ForegroundColor White
    Write-Host "   - GOOGLE_CLIENT_ID" -ForegroundColor White
    Write-Host "   - GOOGLE_CLIENT_SECRET" -ForegroundColor White
    Write-Host "   - GOOGLE_REDIRECT_URI" -ForegroundColor White
    Write-Host ""
    $continue = Read-Host "Press Enter after updating .env file to continue, or 'q' to quit"
    if ($continue -eq 'q') {
        exit
    }
}

Write-Host ""

# Step 2: Install dependencies
Write-Host "Step 2: Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules found" -ForegroundColor Green
} else {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Step 3: Run database migration
Write-Host "Step 3: Running database migration..." -ForegroundColor Yellow
Write-Host "This will add googleId and avatarUrl columns to the users table" -ForegroundColor Cyan
$migrate = Read-Host "Do you want to run 'npx drizzle-kit push'? (y/n)"

if ($migrate -eq 'y') {
    npm run db:push
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database migration completed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Database migration failed" -ForegroundColor Red
        Write-Host "Please check your DATABASE_URL in .env file" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "⚠️  Skipping database migration" -ForegroundColor Yellow
    Write-Host "Remember to run 'npm run db:push' before deploying!" -ForegroundColor Cyan
}

Write-Host ""

# Step 4: Verify files
Write-Host "Step 4: Verifying OAuth files..." -ForegroundColor Yellow
$files = @(
    "api\auth\google\redirect.ts",
    "api\auth\google\callback.ts",
    "schema\users.ts",
    "client\src\pages\Login.tsx"
)

$allFilesExist = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file NOT FOUND" -ForegroundColor Red
        $allFilesExist = $false
    }
}

Write-Host ""

if ($allFilesExist) {
    Write-Host "✅ All required files are present" -ForegroundColor Green
} else {
    Write-Host "❌ Some files are missing. Please check the implementation." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 5: Git status
Write-Host "Step 5: Checking Git status..." -ForegroundColor Yellow
git status --short
Write-Host ""

# Step 6: Deployment options
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Set up Google Cloud Console:" -ForegroundColor Yellow
Write-Host "   - Go to https://console.cloud.google.com/" -ForegroundColor White
Write-Host "   - Create OAuth 2.0 credentials" -ForegroundColor White
Write-Host "   - Add redirect URI: https://tenderlert.vercel.app/api/auth/google/callback" -ForegroundColor White
Write-Host ""
Write-Host "2. Add environment variables to Vercel:" -ForegroundColor Yellow
Write-Host "   - Go to Vercel Dashboard → Settings → Environment Variables" -ForegroundColor White
Write-Host "   - Add all variables from .env file" -ForegroundColor White
Write-Host ""
Write-Host "3. Deploy to Vercel:" -ForegroundColor Yellow
Write-Host "   git add ." -ForegroundColor White
Write-Host "   git commit -m 'Add Google OAuth 2.0 integration'" -ForegroundColor White
Write-Host "   git push" -ForegroundColor White
Write-Host ""
Write-Host "4. Test the integration:" -ForegroundColor Yellow
Write-Host "   - Visit https://tenderlert.vercel.app/login" -ForegroundColor White
Write-Host "   - Click 'Continue with Google'" -ForegroundColor White
Write-Host "   - Verify successful authentication" -ForegroundColor White
Write-Host ""

$deploy = Read-Host "Do you want to commit and push now? (y/n)"

if ($deploy -eq 'y') {
    Write-Host ""
    Write-Host "Committing changes..." -ForegroundColor Yellow
    git add .
    git commit -m "Add Google OAuth 2.0 integration"
    
    Write-Host "Pushing to remote..." -ForegroundColor Yellow
    git push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Successfully pushed to remote!" -ForegroundColor Green
        Write-Host "Vercel will automatically deploy your changes." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Don't forget to:" -ForegroundColor Yellow
        Write-Host "1. Set up Google Cloud Console credentials" -ForegroundColor White
        Write-Host "2. Add environment variables to Vercel" -ForegroundColor White
    } else {
        Write-Host "❌ Failed to push to remote" -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "Deployment skipped. Run the commands manually when ready." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Deployment Helper Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 For detailed instructions, see:" -ForegroundColor Cyan
Write-Host "   - GOOGLE_OAUTH_GUIDE.md" -ForegroundColor White
Write-Host "   - OAUTH_FILE_SUMMARY.md" -ForegroundColor White
Write-Host ""
