# Supabase Setup Instructions

## 1. Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/sign in and create a new project
3. Wait for the project to be fully provisioned

## 2. Get Your Project Credentials
1. Go to your project dashboard
2. Click on "Settings" in the sidebar
3. Click on "API" in the settings menu
4. Copy the "Project URL" and "anon public" key

## 3. Update Environment Variables
1. Open the `.env.local` file in your project root
2. Replace the placeholder values with your actual Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## 4. Set Up Authentication
1. In your Supabase dashboard, go to "Authentication" > "Settings"
2. Configure your authentication settings as needed
3. Create a user account for admin access:
   - Go to "Authentication" > "Users"
   - Click "Add user"
   - Enter email and password for admin access

## 5. Database Setup (Optional)
If you need database tables, you can create them in:
- Supabase Dashboard > SQL Editor
- Or use the Table Editor

## 6. Test the Setup
1. Restart your development server: `npm run dev`
2. Try logging in with the admin credentials you created
3. Check the browser console for any remaining errors

## Common Issues
- **"Missing Supabase environment variables"**: Make sure `.env.local` exists and has the correct values
- **"Invalid login credentials"**: Ensure the user exists in your Supabase auth users table
- **"Auth session missing"**: This usually resolves once environment variables are properly set
