# Supabase Migration (DB folder)

This folder handles all database structure for the EduCore cache tables (60-day retention).

- No `.env` file required.
- Railway automatically provides the `DATABASE_URL` connection string.
- Running `npm install` will automatically trigger the migration.

## Manual run (optional)
```bash
DATABASE_URL="postgres://USER:PASSWORD@HOST:PORT/DB?sslmode=require" npm run migrate
```

## Update schema

When adding or modifying tables:

1. Edit `migration.sql`
2. Run again:

   ```bash
   npm run migrate
   ```

It will safely apply updates using `CREATE IF NOT EXISTS`.
