@echo off
echo Starting Database Setup for Interview Genie...
echo -----------------------------------------------

echo Checking if Docker is running...
docker info > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Docker is not running. Please start Docker Desktop first.
  exit /b 1
)

echo Starting PostgreSQL container...
docker-compose up -d db

echo Waiting for database to be ready...
timeout /t 10 /nobreak > nul

echo Running Prisma migrations...
npx prisma migrate dev --name init

echo Generating Prisma client...
npx prisma generate

echo Database setup complete!
echo -----------------------------------------------
echo Database Information:
echo Host: localhost
echo Port: 5432
echo Database: interview_genie
echo Username: postgres
echo Password: postgres
echo Connection URL: postgresql://postgres:postgres@localhost:5432/interview_genie
echo -----------------------------------------------
echo Add the following to your .env.local file if not already present:
echo DATABASE_URL=postgresql://postgres:postgres@localhost:5432/interview_genie
echo -----------------------------------------------
echo To view your database with Prisma Studio, run:
echo npx prisma studio

pause 