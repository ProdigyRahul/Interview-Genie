@echo off
echo Setting environment variables...

:: NextAuth environment variables
set NEXTAUTH_SECRET=a_very_long_secret_value_for_nextauth
set NEXTAUTH_URL=http://localhost:3000
set NEXT_PUBLIC_APP_URL=http://localhost:3000
set NODE_ENV=production

:: Set the trusted hosts
set AUTH_TRUST_HOST=true

echo Starting the application in production mode...
cd .next\standalone
node server.js 