# Deployment Guide

This guide will help you deploy the Redis Rate Limiter application to a cloud platform.

## 🚀 Recommended Deployment Platforms

### Option 1: Render (Recommended - Free Tier Available)

**Render** is perfect for this project as it supports Redis, PostgreSQL, and MongoDB add-ons.

#### Steps:

1. **Push to GitHub** (already done)
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin master
   ```

2. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

3. **Deploy Redis**
   - Click "New +" → "Redis"
   - Name: `rate-limiter-redis`
   - Select free plan
   - Click "Create Redis"
   - Copy the **Internal Redis URL**

4. **Deploy MongoDB**
   - Render doesn't offer MongoDB - use MongoDB Atlas (free):
     - Go to https://www.mongodb.com/cloud/atlas
     - Create free cluster
     - Get connection string

5. **Deploy Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `redis-rate-limiter`
     - **Environment**: `Node`
     - **Build Command**: `npm run install-all && npm run build`
     - **Start Command**: `npm start`
     - **Environment Variables**:
       ```
       NODE_ENV=production
       PORT=3000
       REDIS_URL=<your-redis-internal-url>
       MONGO_URI=<your-mongodb-atlas-url>
       CORS_ORIGIN=https://your-app-name.onrender.com
       ```
   - Click "Create Web Service"

6. **Access Your App**
   - Your app will be available at: `https://your-app-name.onrender.com`

---

### Option 2: Railway (Easy Setup)

**Railway** offers a simple deployment with Redis support.

#### Steps:

1. **Push to GitHub** (already done)

2. **Deploy to Railway**
   - Go to https://railway.app
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

3. **Add Redis**
   - Click "New" → "Database" → "Add Redis"
   - Railway will automatically set `REDIS_URL`

4. **Add MongoDB**
   - Click "New" → "Database" → "Add MongoDB"
   - Railway will automatically set `MONGO_URL`

5. **Configure Environment Variables**
   - Click on your service
   - Go to "Variables" tab
   - Add:
     ```
     NODE_ENV=production
     CORS_ORIGIN=${{RAILWAY_PUBLIC_DOMAIN}}
     ```

6. **Configure Build**
   - In Settings, set:
     - **Build Command**: `npm run install-all && npm run build`
     - **Start Command**: `npm start`

7. **Generate Domain**
   - Go to Settings → Generate Domain
   - Your app will be available at the generated URL

---

### Option 3: Heroku (Paid)

**Note**: Heroku no longer offers free tiers, but instructions are included for reference.

#### Steps:

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

3. **Add Redis Add-on**
   ```bash
   heroku addons:create heroku-redis:mini
   ```

4. **Add MongoDB Add-on**
   ```bash
   heroku addons:create mongolab:sandbox
   ```

5. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set CORS_ORIGIN=https://your-app-name.herokuapp.com
   ```

6. **Deploy**
   ```bash
   git push heroku master
   ```

7. **Access Your App**
   ```bash
   heroku open
   ```

---

## 🔧 Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port (auto-set by host) | `3000` |
| `REDIS_URL` | Redis connection URL | `redis://user:pass@host:6379` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `CORS_ORIGIN` | Frontend URL for CORS | `https://your-app.com` |

---

## 📝 Post-Deployment Checklist

- [ ] App loads successfully
- [ ] All 4 API buttons work
- [ ] Rate limiting is functional
- [ ] Headers are displayed correctly
- [ ] Request history updates
- [ ] Throttle events are logged to MongoDB
- [ ] UI is responsive on mobile

---

## 🐛 Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

### API Requests Fail
- Verify CORS_ORIGIN matches your deployed URL
- Check Redis and MongoDB connections
- Review server logs

### Rate Limiting Not Working
- Ensure Redis is connected (check logs)
- Verify REDIS_URL environment variable
- Check Redis add-on is running

### UI Not Loading
- Verify build command ran successfully
- Check that `client/dist` folder exists after build
- Ensure `express.static` is serving from correct path

---

## 📊 Monitoring

After deployment, monitor:
- **Response times** for API endpoints
- **Redis memory usage** (token bucket storage)
- **MongoDB storage** (throttle events)
- **Error rates** in server logs

---

## 🔄 Continuous Deployment

To enable automatic deployments on Git push:
1. Connect your GitHub repo to your platform
2. Enable auto-deploy on the main/master branch
3. Each push will trigger a new deployment

---

## 💡 Tips

1. **Use Production Databases**: Don't use local Redis/MongoDB in production
2. **Environment Variables**: Never commit sensitive data to Git
3. **Monitoring**: Set up logging and monitoring (Sentry, LogRocket)
4. **SSL**: Most platforms provide free SSL certificates
5. **Custom Domain**: You can add your own domain in platform settings

---

## 🆘 Need Help?

- Render Docs: https://render.com/docs
- Railway Docs: https://docs.railway.app
- Heroku Docs: https://devcenter.heroku.com

Good luck with your deployment! 🚀
