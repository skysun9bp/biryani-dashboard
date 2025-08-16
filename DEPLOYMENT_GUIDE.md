# 🚀 Deployment Guide

This guide will help you deploy the Biryani Dashboard to production using Vercel (frontend) and Railway (backend).

## 📋 Prerequisites

- GitHub repository with your code
- Vercel account (free tier available)
- Railway account (free tier available)
- Google Sheets API access

## 🎯 Deployment Strategy

- **Frontend**: Vercel (React app)
- **Backend**: Railway (Express.js + SQLite)
- **Database**: SQLite (Railway provides persistent storage)

## 🎨 Frontend Deployment (Vercel)

### Step 1: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository: `skysun9bp/biryani-dashboard`
4. Select the repository and click "Deploy"

### Step 2: Configure Build Settings

Vercel should auto-detect the settings, but verify:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 3: Set Environment Variables

In Vercel dashboard, go to Settings → Environment Variables:

```env
VITE_API_URL=https://your-backend-url.railway.app
```

### Step 4: Deploy

1. Click "Deploy" 
2. Wait for build to complete
3. Your frontend will be live at: `https://your-project.vercel.app`

## 🔧 Backend Deployment (Railway)

### Step 1: Connect to Railway

1. Go to [railway.app](https://railway.app) and sign up/login
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

### Step 2: Configure Backend Directory

1. In Railway dashboard, go to Settings
2. Set **Root Directory** to: `backend`
3. This tells Railway to deploy only the backend folder

### Step 3: Set Environment Variables

In Railway dashboard, go to Variables tab:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3001
FRONTEND_URL="https://your-frontend-url.vercel.app"
VITE_GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key
VITE_SPREADSHEET_ID=your_spreadsheet_id
```

### Step 4: Configure Build Commands

Railway will auto-detect, but verify these commands:

- **Install Command**: `npm install`
- **Start Command**: `npm start`

### Step 5: Deploy and Setup Database

1. Click "Deploy" and wait for completion
2. Go to the deployed app URL
3. Run database setup commands in Railway's terminal:

```bash
npx prisma db push
npm run db:seed
npm run migrate:final
```

### Step 6: Get Backend URL

1. In Railway dashboard, go to your deployed service
2. Copy the generated URL (e.g., `https://your-app.railway.app`)
3. Update your Vercel environment variable `VITE_API_URL` with this URL

## 🔄 Update Frontend API URL

1. Go back to Vercel dashboard
2. Update the `VITE_API_URL` environment variable with your Railway backend URL
3. Redeploy the frontend (Vercel will auto-redeploy)

## 🧪 Test Your Deployment

1. **Frontend**: Visit your Vercel URL
2. **Login**: Use `admin@biryani.com` / `admin123`
3. **Test Features**: 
   - Dashboard loading
   - Data entry forms
   - Reports and charts
   - Export functionality

## 🔒 Security Considerations

### Environment Variables
- Never commit sensitive data to Git
- Use strong JWT secrets in production
- Restrict Google Sheets API key to your domain

### CORS Configuration
- Backend is configured to allow your Vercel domain
- Update `FRONTEND_URL` in backend environment

### Database Security
- SQLite file is stored securely on Railway
- Regular backups recommended for production

## 📊 Monitoring and Maintenance

### Vercel Monitoring
- Built-in analytics and performance monitoring
- Automatic deployments on Git push
- Preview deployments for pull requests

### Railway Monitoring
- Built-in logs and monitoring
- Automatic restarts on crashes
- Resource usage tracking

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify `FRONTEND_URL` in backend environment
   - Check that frontend URL matches exactly

2. **Database Connection Issues**
   - Ensure `DATABASE_URL` is set correctly
   - Run `npx prisma db push` in Railway terminal

3. **Authentication Failures**
   - Verify `JWT_SECRET` is set
   - Check that users are seeded: `npm run db:seed`

4. **API Connection Issues**
   - Verify `VITE_API_URL` points to correct Railway URL
   - Check Railway service is running

### Debug Commands

```bash
# Check Railway logs
railway logs

# Access Railway terminal
railway shell

# Run database commands
npx prisma db push
npm run db:seed
npm run migrate:final
```

## 🔄 Continuous Deployment

### Automatic Deployments
- **Vercel**: Automatically deploys on push to main branch
- **Railway**: Automatically deploys on push to main branch

### Manual Deployments
- Vercel: Trigger from dashboard or `vercel --prod`
- Railway: Trigger from dashboard or `railway up`

## 📈 Scaling Considerations

### Free Tier Limits
- **Vercel**: 100GB bandwidth/month, 100 serverless function executions/day
- **Railway**: $5 credit/month, suitable for small to medium usage

### Production Scaling
- Consider PostgreSQL for larger datasets
- Implement caching for better performance
- Add monitoring and alerting

## 🎉 Success!

Your Biryani Dashboard is now live and ready for production use!

- **Frontend**: https://your-project.vercel.app
- **Backend**: https://your-app.railway.app
- **Login**: admin@biryani.com / admin123

---

**Need help?** Check the main README.md or open an issue on GitHub.
