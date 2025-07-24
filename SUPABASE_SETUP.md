# PantryPal Supabase Setup Guide

## Overview
PantryPal is now fully integrated with Supabase for authentication and data storage!

## Database Setup

1. **Go to your Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard/project/rvhktruqktggdmsozybp

2. **Set up the Database Schema**
   - Go to the SQL Editor in your Supabase dashboard
   - Copy and paste the entire contents of `supabase/schema.sql`
   - Click "Run" to execute the SQL and create your tables

3. **Enable Email Authentication**
   - Go to Authentication > Providers
   - Make sure Email is enabled
   - Configure email templates if desired

## Features

### 🔐 Authentication
- Sign up with email/password
- Sign in with existing account
- Secure session management
- Automatic creation of default categories on signup

### 📦 Pantry Management
- Add items with quantity, unit, and category
- Set expiration dates with visual warnings
- Add notes to items
- Edit existing items
- Delete items
- Color-coded categories

### 🏷️ Categories
Default categories created for each user:
- Produce (Green)
- Dairy (Blue)
- Meat (Red)
- Grains (Orange)
- Canned Goods (Purple)
- Spices (Pink)
- Snacks (Orange)
- Beverages (Cyan)
- Other (Gray)

### 🔒 Security
- Row Level Security (RLS) enabled
- Users can only see and modify their own data
- Secure authentication with JWT tokens

## Running the App

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   Navigate to http://localhost:5173

## Testing the App

1. Click "Sign Up" to create a new account
2. Enter your email and a password
3. Check your email for the confirmation link (if email confirmation is enabled)
4. Sign in with your credentials
5. Start adding items to your pantry!

## Environment Variables

Your `.env` file is already configured with:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

⚠️ **Important**: Never commit your `.env` file to version control!

## Troubleshooting

### "Error loading pantry items"
- Check that you've run the SQL schema in Supabase
- Verify your environment variables are correct
- Check the browser console for detailed error messages

### Can't sign up/sign in
- Ensure email authentication is enabled in Supabase
- Check if email confirmation is required and check your email
- Verify your Supabase project is not paused

### Categories not showing
- Categories are created automatically on signup
- If missing, you can manually run the category creation in the SQL editor

## Next Steps

- Consider adding social authentication providers (Google, GitHub, etc.)
- Set up email templates for better user experience
- Configure custom domain and email sender
- Add real-time subscriptions for collaborative pantries
- Implement sharing pantries between family members
