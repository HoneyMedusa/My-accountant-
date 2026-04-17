# My Accountant - Business Management App

A professional dashboard for managing daily cash-ups, business expenses, and weekly stock inventory. Built with React, Vite, Tailwind CSS, and Firebase.

## Features
- **Dashboard**: Real-time overview of sales, expenses, and profit trends.
- **Weekly Stock**: Manage inventory levels and track total asset value.
- **Daily Cash-ups**: Record daily sales figures.
- **Expenses**: Categorize and track business spending.
- **AI Assistant**: Get help with business queries using the Gemini-powered chatbot.
- **Dark Mode**: Toggle between light and dark themes.

## Deployment on Netlify

This project is pre-configured for one-click deployment to Netlify.

### Option 1: Using Netlify CLI
1. Install Netlify CLI: `npm install -g netlify-cli`
2. Run `netlify deploy`
3. Follow the prompts!

### Option 2: Connect to GitHub (Continuous Deployment)
1. Push this code to a GitHub repository.
2. Sign in to [Netlify](https://www.netlify.com/).
3. Click "Add new site" > "Import an existing project".
4. Select your GitHub repository.
5. Netlify will automatically detect the settings from `netlify.toml`:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
6. Click "Deploy site".

### Environment Variables
For the app to work correctly, you must add your Firebase configuration to Netlify's environment variables. 
Go to **Site Settings > Build & deploy > Environment variables** and add the values found in your `firebase-applet-config.json`.

---
Built with Google AI Studio Build.
