# 🔧 Fix Supabase Read-Only Table: ai_chart_transcriptions

## Problem

The `ai_chart_transcriptions` table in Supabase is read-only, causing INSERT/UPDATE operations to fail silently.

## Root Cause

In Supabase, tables created via SQL migrations don't automatically grant write permissions to all roles. The table needs explicit `GRANT` statements for:
- `anon` (anonymous users)
- `authenticated` (logged-in users)  
- `service_role` (backend service)
- `postgres` (superuser)

Additionally, Row Level Security (RLS) may be enabled, which blocks writes unless policies are defined.

## Solution

Run the permissions migration to:
1. ✅ Grant ALL privileges to all Supabase roles
2. ✅ Disable Row Level Security (RLS)
3. ✅ Ensure table is owned by `postgres`
4. ✅ Verify write access works

---

## 🚀 Quick Fix

### Option 1: Run via Script (Recommended)

```bash
# From project root
node backend/scripts/fixPermissions.js
```

This will:
- Read `DB/fix_ai_chart_transcriptions_permissions.sql`
- Execute all permission grants
- Disable RLS
- Test write access
- Show verification results

### Option 2: Run SQL Directly

If you have direct access to Supabase SQL Editor:

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `DB/fix_ai_chart_transcriptions_permissions.sql`
3. Paste and run
4. Check the output for verification messages

### Option 3: Via psql

```bash
psql "$DATABASE_URL" -f DB/fix_ai_chart_transcriptions_permissions.sql
```

---

## ✅ Verify Fix

After running the migration, test write access:

```bash
node backend/scripts/testWrite.js
```

This will:
- ✅ Test INSERT
- ✅ Test SELECT (read back)
- ✅ Test UPDATE
- ✅ Verify data persistence

**Expected output:**
```
✅✅✅ ALL TESTS PASSED! ✅✅✅
The table ai_chart_transcriptions is fully writable!
```

---

## 🔍 What the Migration Does

### Step 1: Detect Current State
- Checks current user/role
- Verifies table exists in `public` schema
- Checks if RLS is enabled

### Step 2: Grant Permissions
```sql
GRANT ALL PRIVILEGES ON TABLE public.ai_chart_transcriptions TO anon;
GRANT ALL PRIVILEGES ON TABLE public.ai_chart_transcriptions TO authenticated;
GRANT ALL PRIVILEGES ON TABLE public.ai_chart_transcriptions TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.ai_chart_transcriptions TO postgres;
```

### Step 3: Disable RLS
```sql
ALTER TABLE public.ai_chart_transcriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chart_transcriptions FORCE ROW LEVEL SECURITY FALSE;
```

### Step 4: Set Owner
```sql
ALTER TABLE public.ai_chart_transcriptions OWNER TO postgres;
```

### Step 5: Verify Permissions
- Lists all grants for the table
- Shows RLS status
- Tests actual INSERT/UPDATE

### Step 6: Test Write Access
- Inserts a test row
- Reads it back
- Updates it
- Verifies data matches
- Cleans up

---

## 🐛 Troubleshooting

### Error: "Table does not exist"
**Solution:** Run the main migration first:
```bash
node backend/scripts/runMigration.js
```

### Error: "Permission denied"
**Solution:** Make sure your `DATABASE_URL` uses a role with superuser privileges (usually `postgres` or `service_role`).

### Error: "RLS is still enabled"
**Solution:** The migration should disable it, but if it persists:
```sql
ALTER TABLE public.ai_chart_transcriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chart_transcriptions FORCE ROW LEVEL SECURITY FALSE;
```

### Error: "Cannot grant to role X"
**Solution:** Some roles might not exist. The migration tries to grant to common roles, but if one fails, it continues with others. Check which role your `DATABASE_URL` uses and ensure it's granted.

---

## 📊 Check Current Permissions

To see what permissions are currently set:

```sql
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
AND table_name = 'ai_chart_transcriptions'
ORDER BY grantee, privilege_type;
```

To check RLS status:

```sql
SELECT 
  relname as table_name,
  relrowsecurity as rls_enabled
FROM pg_class
WHERE relname = 'ai_chart_transcriptions'
AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
```

---

## 🔄 After Fixing

Once permissions are fixed:

1. ✅ Restart your backend server
2. ✅ Try "Refresh Data" in Dashboard
3. ✅ Check backend logs for `[DB] ✅✅✅ SUCCESS!`
4. ✅ Verify in Reports that transcriptions update

---

## 📝 Files

- **`DB/fix_ai_chart_transcriptions_permissions.sql`** - SQL migration with all fixes
- **`backend/scripts/fixPermissions.js`** - Node.js script to run the migration
- **`backend/scripts/testWrite.js`** - Script to verify write access works

---

## ⚠️ Important Notes

1. **This migration is idempotent** - Safe to run multiple times
2. **It only affects `ai_chart_transcriptions`** - Other tables are unchanged
3. **RLS is disabled** - If you need RLS later, you'll need to add policies
4. **Grants are to common roles** - If you use a custom role, grant it manually

---

## ✅ Success Criteria

After running the fix, you should see:

1. ✅ Migration completes without errors
2. ✅ `testWrite.js` passes all tests
3. ✅ Backend can INSERT/UPDATE transcriptions
4. ✅ `updated_at` column changes on updates
5. ✅ Reports show updated transcriptions after refresh

---

## 🆘 Still Having Issues?

If the fix doesn't work:

1. **Check DATABASE_URL:**
   ```bash
   echo $DATABASE_URL | grep -o 'user=[^;]*'
   ```
   This shows which role you're using.

2. **Check table owner:**
   ```sql
   SELECT tablename, tableowner 
   FROM pg_tables 
   WHERE tablename = 'ai_chart_transcriptions';
   ```

3. **Check grants for your role:**
   ```sql
   SELECT * FROM information_schema.role_table_grants
   WHERE table_name = 'ai_chart_transcriptions'
   AND grantee = current_user;
   ```

4. **Share the error message** from the migration output.

---

**Last updated:** After fixing permissions, the table should be fully writable! 🎉

