# 🔍 RLS Data Isolation Troubleshooting Guide

## Problem: All data is visible to all users instead of being isolated

### 🚨 Most Common Causes

1. **Using Service Role Key Instead of Anon Key**
2. **RLS Policies Not Applied Correctly**
3. **Authentication Not Working Properly**
4. **Database Client Configuration Issues**

---

## 🔧 Step-by-Step Debugging

### Step 1: Run the Hotfix Script
```sql
-- Execute this first to fix the RLS policies
\i database-hotfix.sql
```

### Step 2: Debug Authentication
```sql
-- Run this to check your current authentication status
\i database-debug.sql
```

### Step 3: Check Environment Variables
Make sure you're using the **ANON KEY**, not the **SERVICE ROLE KEY**:

```env
# ✅ CORRECT - Use these for client connections
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (anon key)

# ❌ WRONG - Don't use service role for client
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (service role key)
```

### Step 4: Verify RLS is Enabled
```sql
-- Should return 'true' for all tables
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename IN ('menu_item', 'orders', 'order_item');
```

### Step 5: Test User Authentication
In your browser console or API test:
```javascript
// Test if user is authenticated
const { data: { user } } = await supabase.auth.getUser()
console.log('Current user:', user?.email)
```

---

## 🔧 Common Fixes

### Fix 1: Update RLS Policies (Run Hotfix)
The original policy was too permissive. The hotfix corrects this.

### Fix 2: Ensure Proper Authentication
```typescript
// In your app, make sure users are logged in before accessing data
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  // Redirect to login or show auth required message
  router.push('/login')
  return
}
```

### Fix 3: Check Supabase Configuration
```typescript
// Verify you're using the anon key
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Anon Key starts with:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20))
```

### Fix 4: Test RLS Bypass Detection
```sql
-- If this returns 'service_role', you're bypassing RLS
SELECT auth.role();
```

---

## 🧪 Testing Checklist

After applying fixes, test:

- [ ] **Different Users**: Create 2+ test accounts
- [ ] **Menu Items**: User A creates item, User B should NOT see it
- [ ] **Orders**: User A's orders should NOT be visible to User B  
- [ ] **Public Items**: Items with `created_by_email = NULL` should be visible to all
- [ ] **Admin Access**: Service role should see everything

---

## 🔍 Debug Queries

### See What Current User Can Access
```sql
-- Run while logged in as a specific user
SELECT 'MENU ITEMS' as type, count(*) as visible_count FROM menu_item;
SELECT 'ORDERS' as type, count(*) as visible_count FROM orders;
SELECT 'USER EMAIL' as type, auth.jwt() ->> 'email' as current_user;
```

### Check Policy Logic
```sql
-- This should match what the user actually sees
SELECT 
    name,
    created_by_email,
    auth.jwt() ->> 'email' as current_user,
    (created_by_email IS NULL OR created_by_email = auth.jwt() ->> 'email') as should_see
FROM menu_item;
```

---

## 🚨 Emergency Rollback

If you need to temporarily disable RLS for debugging:

```sql
-- ⚠️ WARNING: This makes ALL data public
ALTER TABLE menu_item DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_item DISABLE ROW LEVEL SECURITY;
```

**Re-enable immediately after debugging:**
```sql
ALTER TABLE menu_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item ENABLE ROW LEVEL SECURITY;
```

---

## 📞 Next Steps

1. **Run `database-hotfix.sql`** to fix the policies
2. **Run `database-debug.sql`** to check your setup
3. **Verify environment variables** are using anon key
4. **Test with multiple user accounts**
5. **Check browser network tab** for authentication headers

If issues persist, check:
- Supabase project settings
- Authentication provider configuration
- Middleware setup for session refresh

---

*Remember: Proper data isolation is crucial for a multi-tenant system. Don't skip the verification steps!* 🔐
