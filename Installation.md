## Prerequisites

- **Node.js**: Version 18 or higher
- **pnpm**: Version 9.0.0 (specified in package.json)
- **PostgreSQL**: Database server running and accessible

## Setup Steps

### 1. Install pnpm (if not already installed)

```bash
npm install -g pnpm@9.0.0
```

### 2. Install Dependencies

From the root of the project, install all dependencies:

```bash
pnpm install
```

### 3. Database Setup

1. Make sure you have a PostgreSQL database running (you can run it locally or use a cloud service like Supabase/Neon etc.)
2. Set up your database connection string in the environment variables (use .env.example for reference and also create .env files for every .env.example)
3. Run Prisma migrations to set up the database schema:

```bash
cd packages/db (from the root directory of the project)
npx prisma migrate dev
npx prisma generate
cd ../.. (get to the root directory again or open a new tab)
```

### 4. Environment Variables

Use .env.example for reference for .env files

**Note:** For Supabase or other cloud PostgreSQL providers, ensure your `DATABASE_URL` includes SSL parameters.

### 5. Running the Application

**Important:** Currently, the frontend, backend, and websocket server need to be run separately in different terminal windows. This is a known limitation that will be addressed in the future.

#### Terminal 1: Frontend

```bash
pnpm run dev --filter excalidraw-frontend
```

The frontend will typically run on `http://localhost:3000`

#### Terminal 2: HTTP Backend

```bash
pnpm run dev --filter http-backend
```

The HTTP backend will run on `http://localhost:3001`

#### Terminal 3: WebSocket Server

```bash
pnpm run dev --filter ws-backend
```

The WebSocket server will run on `ws://localhost:8080`

Happy Development!
