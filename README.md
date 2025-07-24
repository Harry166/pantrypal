# PantryPal

A simple and intuitive pantry management app to help you track your ingredients, manage shopping lists, and find recipes based on what you have.

## Features

- **Pantry Management**: Track items in your fridge, pantry, and freezer
- **Shopping List**: Automatically move items from shopping list to pantry when purchased
- **Smart Categorization**: Items are automatically categorized based on their names
- **Custom Lists**: Create custom storage locations (like "Spice Rack")
- **Staples Tracking**: Frequently added items are automatically marked as staples
- **Recipe Finder**: Find recipes based on ingredients you have
- **User Authentication**: Secure login with Supabase authentication

## Tech Stack

- React 18
- Vite
- Supabase (Authentication & Database)
- CSS (Custom styling)

## Deployment

This app is configured for deployment on Render. The `render.yaml` file contains all necessary configuration.

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Create a `.env` file with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## License

Private project
