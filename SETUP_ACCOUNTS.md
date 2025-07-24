# Setting Up Account Creation for PantryPal

This guide will help you set up the account creation feature to sync your pantry data across multiple devices.

## Prerequisites

1. Node.js installed on your computer
2. A free Supabase account (we'll create one in the steps below)

## Step 1: Create a Supabase Account

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign up for a free account
3. Create a new project (choose a name like "pantrypal")
4. Wait for the project to finish setting up

## Step 2: Set Up the Database

Once your project is ready, you need to create a table for storing pantry items:

1. In your Supabase dashboard, go to the SQL Editor
2. Run the following SQL command:

```sql
-- Create pantry_items table
CREATE TABLE pantry_items (
  id BIGINT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  date_added TIMESTAMPTZ DEFAULT NOW(),
  expiration_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;

-- Create policies to allow users to only see and modify their own items
CREATE POLICY "Users can view their own items" ON pantry_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own items" ON pantry_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items" ON pantry_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items" ON pantry_items
  FOR DELETE USING (auth.uid() = user_id);

-- Create an index for better performance
CREATE INDEX idx_pantry_items_user_id ON pantry_items(user_id);
```

## Step 3: Get Your API Credentials

1. In your Supabase dashboard, go to Settings → API
2. Copy your project URL (it looks like `https://xxxxxxxxxxxxx.supabase.co`)
3. Copy your anon/public API key (a long string)

## Step 4: Configure PantryPal

1. In your PantryPal project folder, create a file named `.env`
2. Add your Supabase credentials:

```
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

3. Save the file

## Step 5: Install Dependencies and Run

1. Open a terminal in your PantryPal folder
2. Install the new dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## How It Works

- **Without an account**: Your data is stored locally in your browser (just like before)
- **With an account**: Your data syncs to the cloud and can be accessed from any device
- **Security**: Each user can only see and modify their own pantry items
- **Offline support**: The app still works offline and syncs when you're back online

## Using the Account Feature

1. When you open PantryPal, you'll see a sign-in screen
2. Click "Sign Up" to create a new account
3. Enter your email and password (minimum 6 characters)
4. Check your email for a confirmation link
5. Click the link in the email to confirm your account
6. Sign in with your credentials
7. Your pantry data will now sync across all devices where you're signed in!

## Troubleshooting

### "Invalid API key" error
- Double-check that you copied the correct API key from Supabase
- Make sure there are no extra spaces in your `.env` file

### "Cannot connect to Supabase" error
- Check your internet connection
- Verify the Supabase URL is correct
- Make sure your Supabase project is active (free tier projects pause after 1 week of inactivity)

### Email confirmation not received
- Check your spam folder
- You can resend the confirmation email from the sign-in screen

## Data Migration

If you have existing data in PantryPal before adding accounts:
1. Your local data will remain in your browser
2. When you first sign in, you can manually add your items to sync them
3. Future updates will automatically sync

## Privacy & Security

- Your email and password are securely handled by Supabase
- Each user's data is isolated and cannot be accessed by other users
- You can delete your account and all data at any time from the Supabase dashboard
