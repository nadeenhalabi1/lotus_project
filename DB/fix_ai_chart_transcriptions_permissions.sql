-- ============================================================
-- Fix Supabase Read-Only Table: ai_chart_transcriptions
-- ============================================================
-- This migration fixes the issue where ai_chart_transcriptions
-- table is read-only by granting proper permissions and disabling RLS
-- ============================================================

-- Step 1: Detect current state
DO $$
DECLARE
  current_role_name text;
  table_exists boolean;
  rls_enabled boolean;
  table_schema_name text;
BEGIN
  -- Get current role
  SELECT current_user INTO current_role_name;
  RAISE NOTICE 'Current user/role: %', current_role_name;
  
  -- Check if table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'ai_chart_transcriptions'
  ) INTO table_exists;
  
  IF NOT table_exists THEN
    RAISE EXCEPTION 'Table public.ai_chart_transcriptions does not exist! Run main migration first.';
  END IF;
  
  RAISE NOTICE 'Table exists: %', table_exists;
  
  -- Check table schema
  SELECT table_schema INTO table_schema_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'ai_chart_transcriptions';
  
  IF table_schema_name != 'public' THEN
    RAISE WARNING 'Table is in schema % instead of public!', table_schema_name;
  END IF;
  
  RAISE NOTICE 'Table schema: %', table_schema_name;
  
  -- Check RLS status
  SELECT relrowsecurity INTO rls_enabled
  FROM pg_class
  WHERE relname = 'ai_chart_transcriptions'
  AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
  
  RAISE NOTICE 'RLS enabled: %', rls_enabled;
END $$;

-- Step 2: Ensure table is owned by postgres (writable role)
ALTER TABLE IF EXISTS public.ai_chart_transcriptions OWNER TO postgres;

-- Step 3: Grant ALL privileges to common Supabase roles
-- This ensures any role from DATABASE_URL can write to the table

-- Grant to anon (anonymous users)
GRANT ALL PRIVILEGES ON TABLE public.ai_chart_transcriptions TO anon;

-- Grant to authenticated (logged-in users)
GRANT ALL PRIVILEGES ON TABLE public.ai_chart_transcriptions TO authenticated;

-- Grant to service_role (backend service)
GRANT ALL PRIVILEGES ON TABLE public.ai_chart_transcriptions TO service_role;

-- Grant to postgres (superuser - usually the owner)
GRANT ALL PRIVILEGES ON TABLE public.ai_chart_transcriptions TO postgres;

-- Grant to authenticated role (if different from above)
DO $$
BEGIN
  -- Try to grant to any role that might be in DATABASE_URL
  -- This is a catch-all for custom roles
  EXECUTE format('GRANT ALL PRIVILEGES ON TABLE public.ai_chart_transcriptions TO %I', current_user);
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not grant to current_user %: %', current_user, SQLERRM;
END $$;

-- Step 4: Disable Row Level Security (RLS)
-- RLS blocks writes unless policies are defined
-- Since we're using direct PostgreSQL (not Supabase Auth), disable RLS

ALTER TABLE IF EXISTS public.ai_chart_transcriptions DISABLE ROW LEVEL SECURITY;

-- Force RLS to be false (explicit)
ALTER TABLE IF EXISTS public.ai_chart_transcriptions FORCE ROW LEVEL SECURITY FALSE;

-- Step 5: Verify permissions
DO $$
DECLARE
  perm_record record;
  has_insert boolean := false;
  has_update boolean := false;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Verifying permissions for current role:';
  RAISE NOTICE '========================================';
  
  -- Check what permissions current role has
  FOR perm_record IN
    SELECT 
      grantee,
      privilege_type
    FROM information_schema.role_table_grants
    WHERE table_schema = 'public'
    AND table_name = 'ai_chart_transcriptions'
    AND grantee = current_user
  LOOP
    RAISE NOTICE 'Role % has privilege: %', perm_record.grantee, perm_record.privilege_type;
    IF perm_record.privilege_type = 'INSERT' THEN
      has_insert := true;
    END IF;
    IF perm_record.privilege_type = 'UPDATE' THEN
      has_update := true;
    END IF;
  END LOOP;
  
  IF NOT has_insert THEN
    RAISE WARNING 'Current role % does NOT have INSERT permission!', current_user;
  ELSE
    RAISE NOTICE '✅ INSERT permission: GRANTED';
  END IF;
  
  IF NOT has_update THEN
    RAISE WARNING 'Current role % does NOT have UPDATE permission!', current_user;
  ELSE
    RAISE NOTICE '✅ UPDATE permission: GRANTED';
  END IF;
  
  RAISE NOTICE '========================================';
END $$;

-- Step 6: Test write access
DO $$
DECLARE
  test_chart_id text := 'permission-test-' || extract(epoch from now())::text;
  test_text text := 'WRITE TEST - ' || now()::text;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Testing write access...';
  RAISE NOTICE 'Test chart_id: %', test_chart_id;
  RAISE NOTICE '========================================';
  
  -- Try INSERT
  BEGIN
    INSERT INTO public.ai_chart_transcriptions
    (chart_id, chart_signature, model, transcription_text)
    VALUES (test_chart_id, 'test-sig', 'debug', test_text)
    ON CONFLICT (chart_id) DO UPDATE 
    SET transcription_text = test_text || ' UPDATED';
    
    RAISE NOTICE '✅ INSERT/UPDATE succeeded!';
    
    -- Verify the write
    DECLARE
      read_back text;
    BEGIN
      SELECT transcription_text INTO read_back
      FROM public.ai_chart_transcriptions
      WHERE chart_id = test_chart_id;
      
      IF read_back IS NOT NULL THEN
        RAISE NOTICE '✅ Read-back verification: SUCCESS';
        RAISE NOTICE '   Written text: %', substring(read_back, 1, 50);
      ELSE
        RAISE WARNING '⚠️ Read-back verification: FAILED (row not found)';
      END IF;
    END;
    
    -- Clean up test row
    DELETE FROM public.ai_chart_transcriptions WHERE chart_id = test_chart_id;
    RAISE NOTICE '✅ Test row cleaned up';
    
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE EXCEPTION '❌ INSUFFICIENT PRIVILEGES: Cannot INSERT/UPDATE. Check grants.';
    WHEN OTHERS THEN
      RAISE EXCEPTION '❌ WRITE TEST FAILED: %', SQLERRM;
  END;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅✅✅ TABLE IS NOW WRITABLE! ✅✅✅';
  RAISE NOTICE '========================================';
END $$;

-- Step 7: Final verification - show all grants
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
AND table_name = 'ai_chart_transcriptions'
ORDER BY grantee, privilege_type;

-- Step 8: Show RLS status
SELECT 
  relname as table_name,
  relrowsecurity as rls_enabled,
  CASE 
    WHEN relrowsecurity THEN '⚠️ RLS is ENABLED (may block writes)'
    ELSE '✅ RLS is DISABLED (writes allowed)'
  END as rls_status
FROM pg_class
WHERE relname = 'ai_chart_transcriptions'
AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

