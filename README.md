# Interview Genie 🧞‍♂️

An AI-powered interview preparation platform built with the [T3 Stack](https://create.t3.gg/).

## Features 🌟

- AI-powered mock interviews
- Resume analysis and optimization
- LinkedIn profile integration
- Real-time feedback
- Progress tracking
- Document preparation tools

## Tech Stack 🛠️

- [Next.js](https://nextjs.org) - React framework
- [NextAuth.js](https://next-auth.js.org) - Authentication
- [Prisma](https://prisma.io) - Database ORM
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [tRPC](https://trpc.io) - API layer
- PostgreSQL - Database
- Redis - Caching
- Vercel - Hosting

## Documentation 📚

- [Setup Guide](/docs/SETUP.md)
- [Contributing Guidelines](/docs/CONTRIBUTING.md)
- [API Documentation](/docs/api)
- [Component Documentation](/docs/components)

## Environment Variables

The application requires several environment variables to function properly. Create a `.env.local` file in the root directory with the following variables:

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret_key
AUTH_SECRET=your_auth_secret_key
AUTH_TRUST_HOST=true
CSRF_SECRET=your_csrf_secret_key

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/interview_genie

# Google services
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_GEMINI_API=your_google_gemini_api_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_generative_ai_api_key

# GitHub authentication
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret

# Discord authentication
AUTH_DISCORD_ID=your_discord_client_id
AUTH_DISCORD_SECRET=your_discord_client_secret

# Email service
EMAIL_USER=your_email_username
EMAIL_PASS=your_email_password

# Redis cache
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

## Database Setup

We've included a PostgreSQL database in the Docker setup. To initialize the database:

### Windows
```bash
setup-db.bat
```

### Linux/Mac
```bash
chmod +x setup-db.sh
./setup-db.sh
```

This will:
1. Start the PostgreSQL container
2. Run Prisma migrations
3. Generate the Prisma client

If you need to reset the database:
```bash
npx prisma migrate reset
```

To view your database with Prisma Studio:
```bash
npx prisma studio
```

## Running with Docker

### Development

```bash
docker-compose -f docker-compose.dev.yml up --build
```

### Production

```bash
docker-compose up --build
```

## Running Locally

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## Running Production Build with Windows Batch Script

```bash
start-prod.bat
```

## Development Workflow 🔄

1. Create feature branch from `development`
2. Make changes and test
3. Create PR to `development`
4. After review, merge to `development`
5. Periodic releases from `development` to `main`

## Available Scripts 📝

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run format   # Format code
```

## Contributing 🤝

We welcome contributions! Please see our [Contributing Guidelines](/docs/CONTRIBUTING.md).

## Deployment 🌐

This project is deployed on [Vercel](https://vercel.com). For deployment instructions, see:

- [Vercel Deployment Guide](https://create.t3.gg/en/deployment/vercel)
- [Our Setup Guide](/docs/SETUP.md)

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- [T3 Stack](https://create.t3.gg/) for the amazing foundation
- All our contributors and supporters
