# Environment Variables Setup Guide

This file explains all environment variables needed for the Redis Rate Limiter application.

## 📋 Required Environment Variables

### For Local Development

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000
REDIS_URL=redis://localhost:6379
MONGO_URI=mongodb://localhost:27017/rateLimiterDB
CORS_ORIGIN=http://localhost:5173
```

### For Production (Render)

Set these in your Render Web Service dashboard under "Environment" tab:

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Sets production mode |
| `PORT` | (auto-set by Render) | Server port |
| `REDIS_URL` | `redis://red-xxxxx:6379` | **Internal Redis URL** from Render Redis instance |
| `MONGO_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/db` | MongoDB Atlas connection string |
| `CORS_ORIGIN` | `https://your-app.onrender.com` | Your deployed frontend URL |

---

## 🔧 How to Get Each Variable

### 1. REDIS_URL (Render)

1. In Render dashboard, go to your Redis instance
2. Copy the **Internal Redis URL** (NOT External)
3. Format: `redis://red-xxxxxxxxxx:6379`
4. Paste this into `REDIS_URL` environment variable

⚠️ **Important**: Use the Internal URL, not External!

---

### 2. MONGO_URI (MongoDB Atlas)

#### Step-by-Step:

1. **Create Free MongoDB Atlas Account**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Sign up (free tier available)

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose "M0 Free" tier
   - Select region (choose one close to your Render region)
   - Click "Create"

3. **Create Database User**
   - Go to "Database Access" → "Add New Database User"
   - Choose username and password (SAVE THESE!)
   - Set privileges to "Atlas admin"

4. **Whitelist IP Addresses**
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - This allows Render to connect

5. **Get Connection String**
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Format: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

6. **Update Connection String**
   - Replace `<username>` with your database username
   - Replace `<password>` with your database password
   - Add database name: `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/rateLimiterDB?retryWrites=true&w=majority`

7. **Test Connection** (optional)
   - Use MongoDB Compass to verify connection
   - Or test in your local environment first

---

### 3. CORS_ORIGIN

After your Render deployment is complete:

1. Get your deployed URL from Render (e.g., `https://redis-rate-limiter-abc123.onrender.com`)
2. Set `CORS_ORIGIN` to this exact URL
3. **Important**: No trailing slash!

For development: `http://localhost:5173`

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** to Git (already in `.gitignore`)
2. **Rotate credentials** if accidentally exposed
3. **Use strong passwords** for MongoDB users
4. **Restrict IP access** when possible (production deployments)
5. **Use environment-specific values** (don't reuse production credentials locally)

---

## 🐛 Troubleshooting

### MongoDB Connection Errors

**Error**: `connect ECONNREFUSED ::1:27017`
- **Cause**: Using localhost instead of MongoDB Atlas URI
- **Fix**: Set `MONGO_URI` environment variable to your Atlas connection string

**Error**: `Authentication failed`
- **Cause**: Wrong username/password in connection string
- **Fix**: Double-check credentials, regenerate if needed

**Error**: `connection timed out`
- **Cause**: IP not whitelisted on MongoDB Atlas
- **Fix**: Add 0.0.0.0/0 to Network Access in Atlas

---

### Redis Connection Errors

**Error**: `Redis connection refused`
- **Cause**: Wrong Redis URL or using External URL instead of Internal
- **Fix**: Use Internal Redis URL from Render dashboard

**Error**: `Redis connection timeout`
- **Cause**: Redis instance not running
- **Fix**: Check Redis instance status in Render dashboard

---

### CORS Errors

**Error**: `Access-Control-Allow-Origin header`
- **Cause**: `CORS_ORIGIN` doesn't match frontend URL
- **Fix**: Update `CORS_ORIGIN` to exact frontend URL (no trailing slash)

---

## 📊 Verification

After setting all environment variables, your Render logs should show:

```
✅ MongoDB connected successfully
📊 Database: rateLimiterDB
✅ Redis connected
🚀 Server running on port 10000
📊 Environment: production
```

If you see errors, check the troubleshooting section above.

---

## 💡 Pro Tips

1. **Use .env.local for local development** (add to .gitignore)
2. **Document all custom env vars** in this file
3. **Test locally first** before deploying
4. **Use Render's built-in env var editor** for production
5. **Enable auto-deploy** after confirming everything works

---

## 📝 Checklist for Render Deployment

- [ ] Redis instance created in Render
- [ ] MongoDB Atlas cluster created
- [ ] Database user created in Atlas
- [ ] Network access configured (0.0.0.0/0)
- [ ] `NODE_ENV=production` set
- [ ] `REDIS_URL` set (Internal URL)
- [ ] `MONGO_URI` set (Atlas connection string)
- [ ] `CORS_ORIGIN` will be set after first deploy
- [ ] Build command configured
- [ ] Start command configured
- [ ] Deploy triggered

---

## 🆘 Need Help?

- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- Render Docs: https://render.com/docs
- Redis Connection Guide: https://render.com/docs/redis

---

Good luck with your deployment! 🚀
