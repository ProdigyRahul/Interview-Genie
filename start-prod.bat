@echo off
echo Setting environment variables for production...

:: Required environment variables for NextAuth and Next.js
set NEXTAUTH_SECRET=a_very_long_secret_value_for_nextauth
set NEXTAUTH_URL=http://localhost:3000
set NEXT_PUBLIC_APP_URL=http://localhost:3000
set NODE_ENV=production
set AUTH_TRUST_HOST=true

echo Starting the production server...
cd .next\standalone
node server.js 