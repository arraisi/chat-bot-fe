# GitHub Pages Deployment Guide

## Overview
This guide explains how to deploy the Peruri Chat Bot frontend to GitHub Pages.

## Current Configuration

### 1. Base URL Configuration
The project is configured with the correct base URL for GitHub Pages in `vite.config.mts`:
```typescript
base: process.env.NODE_ENV === 'production' ? '/chat-bot-fe/' : '/'
```

### 2. Router Configuration
- Uses `createWebHistory` with proper base URL handling
- Includes fallback routes for Single Page Application (SPA) support
- Route guards allow public access to home page, login, and register pages

### 3. GitHub Pages SPA Support
- Added `public/404.html` for client-side routing support
- Added redirect script in `index.html` to handle GitHub Pages routing
- Added `public/.nojekyll` to disable Jekyll processing

### 4. Landing Page
- Modified the home page to show a public landing page for unauthenticated users
- No longer forces redirect to login for public visitors
- Displays app features and login/register options

## Deployment Steps

### Automatic Deployment (Recommended)
The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically:
1. Builds the project when changes are pushed to the `main` branch
2. Deploys to GitHub Pages

### Manual Deployment
If you need to deploy manually:
1. Build the project: `npm run build`
2. Deploy using gh-pages: `npm run deploy`

## Repository Settings
Make sure your GitHub repository is configured correctly:

1. Go to your repository Settings → Pages
2. Set Source to "GitHub Actions" 
3. The deployment workflow will handle the rest

## Verification
After deployment, your app should be available at:
`https://[username].github.io/chat-bot-fe/`

## Troubleshooting

### Blank Page Issues
If you see a blank page:
1. Check browser console for errors
2. Verify the base URL in `vite.config.mts` matches your repository name
3. Ensure GitHub Pages is enabled in repository settings
4. Check that the deployment workflow completed successfully

### Routing Issues
If routes don't work properly:
1. The `404.html` file handles client-side routing
2. Make sure `.nojekyll` file is present in the public directory
3. Check that the SPA redirect script is in `index.html`

### Authentication in Production
- The app shows a public landing page by default
- Users can access login/register pages
- Authentication state is handled by the `useAuth` composable
- For demo purposes, the landing page is public and doesn't require backend connection

## Development vs Production
- **Development**: Base URL is `/`, auth composable may use dummy data
- **Production**: Base URL is `/chat-bot-fe/`, shows public landing page

## Files Modified for GitHub Pages
- `vite.config.mts` - Base URL configuration
- `src/router/index.ts` - Router base URL and route guards
- `src/pages/index.vue` - Public landing page
- `src/composables/useAuth.ts` - Default authentication state
- `public/404.html` - SPA routing support
- `public/.nojekyll` - Disable Jekyll
- `index.html` - SPA redirect script
