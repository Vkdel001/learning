# Fix Docker Desktop WSL Error on Windows

## The Error
"An unexpected error occurred while executing a WSL command"
"deploying WSL2 distributions ensuring main distro is deployed"

## Solution: Enable WSL 2

### Step 1: Enable WSL and Virtual Machine Platform

Open PowerShell as Administrator and run these commands:

```powershell
# Enable WSL
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# Enable Virtual Machine Platform
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

**Restart your computer after running these commands.**

### Step 2: Download and Install WSL 2 Update

1. Download the WSL 2 kernel update:
   https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi

2. Run the downloaded file and install it

### Step 3: Set WSL 2 as Default

Open PowerShell (doesn't need to be admin) and run:

```powershell
wsl --set-default-version 2
```

### Step 4: Install Ubuntu (or any Linux distro)

```powershell
wsl --install -d Ubuntu
```

This will download and install Ubuntu. You'll be asked to create a username and password (remember these, but they're just for WSL, not critical for our project).

### Step 5: Restart Docker Desktop

1. Close Docker Desktop completely (right-click system tray icon → Quit)
2. Open Docker Desktop again
3. Wait for it to start (should work now!)

---

## Alternative: Use Cloud Databases Instead

If Docker continues to give issues, you can use free cloud databases for development:

### Option A: Neon (PostgreSQL)
1. Go to: https://neon.tech
2. Sign up (free)
3. Create a new project
4. Copy the connection string
5. Paste in your `.env` file as `DATABASE_URL`

### Option B: Upstash (Redis)
1. Go to: https://upstash.com
2. Sign up (free)
3. Create a Redis database
4. Copy the connection string
5. Paste in your `.env` file as `REDIS_URL`

**Advantages of Cloud Databases:**
- ✅ No local setup needed
- ✅ Works immediately
- ✅ Free tier is sufficient for development
- ✅ Same as production environment
- ✅ Accessible from anywhere

**Disadvantages:**
- ❌ Requires internet connection
- ❌ Slightly slower than local (but not noticeable)

---

## Quick Decision Guide

**If you want to continue with Docker:**
- Follow Steps 1-5 above
- Takes 10-15 minutes
- Good learning experience

**If you want to start coding NOW:**
- Use Neon + Upstash (cloud databases)
- Takes 5 minutes
- Can switch to Docker later if needed

---

## Recommended: Use Cloud Databases for Now

Since you're eager to start building, I recommend:

1. **Neon for PostgreSQL** (free tier: 0.5 GB)
   - Sign up: https://neon.tech
   - Create project
   - Copy connection string

2. **Upstash for Redis** (free tier: 10,000 commands/day)
   - Sign up: https://upstash.com
   - Create database
   - Copy connection string

3. **Update your .env file** with the connection strings

4. **Continue with Task 1.2** (Prisma setup)

You can always switch to Docker later once WSL 2 is properly set up!

---

## What Would You Like To Do?

**Option 1:** Fix Docker (10-15 min setup)
- Follow Steps 1-5 above
- Restart computer after Step 1
- Good for long-term

**Option 2:** Use Cloud Databases (5 min setup)
- Sign up for Neon + Upstash
- Get connection strings
- Start coding immediately

Let me know which option you prefer!
