#!/bin/bash

# Setup database script for Interview Genie

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Database Setup for Interview Genie...${NC}"
echo "-----------------------------------------------"

# Check if Docker is running
echo -e "${YELLOW}Checking if Docker is running...${NC}"
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Docker is not running. Please start Docker Desktop first.${NC}"
  exit 1
fi

# Start the database container if it's not already running
echo -e "${YELLOW}Starting PostgreSQL container...${NC}"
docker-compose up -d db

# Wait for database to be ready
echo -e "${YELLOW}Waiting for database to be ready...${NC}"
sleep 5

echo -e "${YELLOW}Running Prisma migrations...${NC}"
# Run Prisma migrations
npx prisma migrate dev --name init

echo -e "${YELLOW}Generating Prisma client...${NC}"
# Generate Prisma client
npx prisma generate

echo -e "${GREEN}Database setup complete!${NC}"
echo "-----------------------------------------------"
echo -e "${YELLOW}Database Information:${NC}"
echo "Host: localhost"
echo "Port: 5432"
echo "Database: interview_genie"
echo "Username: postgres"
echo "Password: postgres"
echo "Connection URL: postgresql://postgres:postgres@localhost:5432/interview_genie"
echo "-----------------------------------------------"
echo -e "${GREEN}Add the following to your .env.local file if not already present:${NC}"
echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/interview_genie"
echo "-----------------------------------------------"
echo -e "${YELLOW}To view your database with Prisma Studio, run:${NC}"
echo "npx prisma studio" 