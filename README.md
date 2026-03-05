# AI Tutor Mauritius 🇲🇺

Free AI-powered tutoring platform for secondary school students in Mauritius who cannot afford private tuition.

## Features

- 🎓 AI-generated lessons aligned with Mauritius curriculum
- 🗣️ Voice narration in multiple languages
- 📝 Practice questions and quizzes
- 📊 Progress tracking and analytics
- 🔐 Simple OTP-based authentication (no passwords to remember)
- 💰 Cost-optimized with aggressive caching

## Tech Stack

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Cache:** Redis
- **AI:** Google Gemini
- **Voice:** ElevenLabs
- **Storage:** Backblaze B2
- **CDN:** Cloudflare

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- Redis 7+
- API keys (see `.env.example`)

### Setup

1. **Clone and install dependencies:**

```bash
npm install
```

2. **Set up databases:**

See `SETUP_DATABASE.md` for detailed instructions.

Quick start with Docker:
```bash
docker-compose up -d
```

3. **Configure environment variables:**

```bash
cp .env.example .env
# Edit .env with your API keys and database URLs
```

4. **Set up Prisma:**

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

5. **Run development server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
ai-tutor-mauritius/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # Student dashboard
│   └── lessons/           # Lesson pages
├── components/            # React components
├── lib/                   # Utility functions
│   ├── db/               # Database utilities
│   ├── cache/            # Redis cache utilities
│   ├── ai/               # AI provider integrations
│   └── auth/             # Authentication utilities
├── prisma/               # Prisma schema and migrations
├── public/               # Static assets
└── .kiro/specs/          # Project specifications
```

## Development

### Run tests:

```bash
npm test
```

### Run Prisma Studio (Database GUI):

```bash
npx prisma studio
```

### Create database migration:

```bash
npx prisma migrate dev --name your_migration_name
```

### Lint code:

```bash
npm run lint
```

## Deployment

See `DEPLOYMENT.md` for production deployment instructions.

## Documentation

- [Requirements](.kiro/specs/ai-tutor-mauritius/requirements.md)
- [Design](.kiro/specs/ai-tutor-mauritius/design.md)
- [Tasks](.kiro/specs/ai-tutor-mauritius/tasks.md)
- [Implementation Guide](.kiro/specs/ai-tutor-mauritius/IMPLEMENTATION_GUIDE.md)
- [Database Setup](SETUP_DATABASE.md)

## Contributing

This is a social impact project. Contributions are welcome!

## License

MIT License - See LICENSE file for details

## Mission

To provide free, high-quality education to students in Mauritius who cannot afford expensive private tuition.

---

Built with ❤️ for Mauritius students
