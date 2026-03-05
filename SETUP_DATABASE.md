# PostgreSQL and Redis Setup Guide (Windows)

## Option 1: Using Docker (Recommended - Easiest)

### Prerequisites
- Install Docker Desktop for Windows: https://www.docker.com/products/docker-desktop

### Setup Steps

1. **Create a docker-compose.yml file in your project root:**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: ai-tutor-postgres
    environment:
      POSTGRES_USER: ai_tutor_user
      POSTGRES_PASSWORD: ai_tutor_password
      POSTGRES_DB: ai_tutor_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: ai-tutor-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

2. **Start the databases:**

```bash
# Start both PostgreSQL and Redis
docker-compose up -d

# Check if they're running
docker ps

# View logs if needed
docker-compose logs postgres
docker-compose logs redis
```

3. **Stop the databases when not needed:**

```bash
docker-compose stop

# Or to remove containers completely
docker-compose down
```

4. **Connection strings for .env:**

```env
DATABASE_URL="postgresql://ai_tutor_user:ai_tutor_password@localhost:5432/ai_tutor_db"
REDIS_URL="redis://localhost:6379"
```

---

## Option 2: Native Installation (More Complex)

### PostgreSQL Setup

1. **Download PostgreSQL:**
   - Go to: https://www.postgresql.org/download/windows/
   - Download the installer (version 15 or later)
   - Run the installer

2. **Installation steps:**
   - Choose installation directory (default is fine)
   - Select components: PostgreSQL Server, pgAdmin 4, Command Line Tools
   - Set data directory (default is fine)
   - Set password for postgres superuser (remember this!)
   - Port: 5432 (default)
   - Locale: Default
   - Complete installation

3. **Create database and user:**

Open Command Prompt or PowerShell and run:

```bash
# Connect to PostgreSQL
psql -U postgres

# In psql prompt, run these commands:
CREATE USER ai_tutor_user WITH PASSWORD 'ai_tutor_password';
CREATE DATABASE ai_tutor_db OWNER ai_tutor_user;
GRANT ALL PRIVILEGES ON DATABASE ai_tutor_db TO ai_tutor_user;
\q
```

4. **Test connection:**

```bash
psql -U ai_tutor_user -d ai_tutor_db -h localhost
```

5. **Connection string for .env:**

```env
DATABASE_URL="postgresql://ai_tutor_user:ai_tutor_password@localhost:5432/ai_tutor_db"
```

### Redis Setup

1. **Download Redis for Windows:**
   - Redis doesn't officially support Windows, but you can use:
   - **Option A:** Memurai (Redis-compatible): https://www.memurai.com/
   - **Option B:** Redis from Microsoft Archive: https://github.com/microsoftarchive/redis/releases

2. **Using Memurai (Recommended for Windows):**
   - Download Memurai installer
   - Run installer (it will install as a Windows service)
   - Default port: 6379
   - Starts automatically

3. **Test Redis connection:**

```bash
# If you have redis-cli installed
redis-cli ping
# Should return: PONG

# Or use telnet
telnet localhost 6379
# Then type: PING
# Should return: +PONG
```

4. **Connection string for .env:**

```env
REDIS_URL="redis://localhost:6379"
```

---

## Option 3: Cloud Services (For Production or if Local Setup Fails)

### PostgreSQL Cloud Options

1. **Neon (Free tier available):**
   - Go to: https://neon.tech
   - Sign up and create a project
   - Copy connection string
   - Free tier: 0.5 GB storage, 1 compute unit

2. **Supabase (Free tier available):**
   - Go to: https://supabase.com
   - Create project
   - Get connection string from Settings > Database
   - Free tier: 500 MB database, 2 GB bandwidth

3. **Railway (Free trial):**
   - Go to: https://railway.app
   - Create PostgreSQL service
   - Copy connection string

### Redis Cloud Options

1. **Upstash (Free tier available):**
   - Go to: https://upstash.com
   - Create Redis database
   - Copy connection string
   - Free tier: 10,000 commands/day

2. **Redis Cloud (Free tier available):**
   - Go to: https://redis.com/try-free
   - Create database
   - Copy connection string
   - Free tier: 30 MB

---

## Verification Steps

### Test PostgreSQL Connection

Create a test file `test-db.js`:

```javascript
const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://ai_tutor_user:ai_tutor_password@localhost:5432/ai_tutor_db'
});

async function testConnection() {
  try {
    await client.connect();
    console.log('✅ PostgreSQL connected successfully!');
    const res = await client.query('SELECT NOW()');
    console.log('Current time from DB:', res.rows[0].now);
    await client.end();
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err.message);
  }
}

testConnection();
```

Run: `node test-db.js`

### Test Redis Connection

Create a test file `test-redis.js`:

```javascript
const Redis = require('ioredis');

const redis = new Redis('redis://localhost:6379');

async function testConnection() {
  try {
    await redis.set('test', 'Hello Redis!');
    const value = await redis.get('test');
    console.log('✅ Redis connected successfully!');
    console.log('Test value:', value);
    await redis.del('test');
    redis.disconnect();
  } catch (err) {
    console.error('❌ Redis connection failed:', err.message);
  }
}

testConnection();
```

Run: `node test-redis.js`

---

## Recommended Approach for Development

**Use Docker (Option 1)** - It's the easiest and most consistent:
- ✅ No complex installation
- ✅ Easy to start/stop
- ✅ Same setup works on any machine
- ✅ Easy to reset if something goes wrong
- ✅ Matches production environment

**For Production:**
- Use managed services (Neon/Supabase for PostgreSQL, Upstash for Redis)
- More reliable, automatic backups, better performance
- Focus on building features, not managing infrastructure

---

## Troubleshooting

### PostgreSQL Issues

**Port already in use:**
```bash
# Check what's using port 5432
netstat -ano | findstr :5432

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Can't connect:**
- Check if PostgreSQL service is running (Services app in Windows)
- Verify firewall isn't blocking port 5432
- Check pg_hba.conf for connection permissions

### Redis Issues

**Port already in use:**
```bash
# Check what's using port 6379
netstat -ano | findstr :6379

# Kill the process
taskkill /PID <PID> /F
```

**Can't connect:**
- Check if Redis/Memurai service is running
- Verify firewall isn't blocking port 6379
- Try restarting the service

---

## Next Steps

Once databases are running:
1. Create `.env` file with connection strings
2. Continue with Task 1.1 (Next.js setup)
3. Install Prisma and configure database connection
4. Run first migration

Good luck! 🚀
