# SurfaceAI Quick Start

Get SurfaceAI up and running in 5 minutes.

## Prerequisites

- Docker and Docker Compose (recommended)
- OR Node.js 20+, PostgreSQL 15+
- GitHub Personal Access Token
- OpenAI API Key

## Option 1: Docker (Easiest)

```bash
# Clone or navigate to surfaceai directory
cd surfaceai

# Start all services
docker-compose up -d

# Run database migrations
docker exec -it surfaceai-backend-1 npm run migrate

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

## Option 2: Local Development

### Backend

```bash
cd backend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Start PostgreSQL (or use Docker)
docker-compose up -d postgres

# Run migrations
npm run migrate

# Start server
npm run dev
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## First Steps

1. **Create Account**
   - Navigate to http://localhost:3000
   - Click "Get Started"
   - Create your account

2. **Create Organization**
   - After login, create or select an organization

3. **Add GitHub Repository**
   - Click "Add Repository"
   - Enter repository name (owner/repo)
   - Enter repository URL
   - Provide GitHub token

4. **Run First Scan**
   - Click "Scan Now" on your repository
   - Wait for scan to complete
   - Review findings

## Environment Variables

### Backend (.env)

```env
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/surfaceai
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-...
GITHUB_APP_ID=your-app-id
GITHUB_APP_PRIVATE_KEY=your-private-key
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## GitHub Token Setup

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate new token with `repo` scope
3. Copy token and use when adding repositories

## Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
docker ps

# Verify connection string in .env
# Test connection
psql $DATABASE_URL
```

### Port Already in Use
```bash
# Change ports in docker-compose.yml
# Or stop conflicting services
```

### OpenAI API Errors
- Verify API key is correct
- Check API quota/billing
- Ensure key has proper permissions

## Next Steps

- Read [README.md](README.md) for full documentation
- Check [API Documentation](docs/API.md) for integration
- Review [Screenshots](screenshots/) for UI reference

---

**Need Help?** Open an issue on GitHub or check the documentation.

