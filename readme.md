# Zoho Projects Secure Proxy - Vercel Deployment

## 🚀 Quick Setup Guide

### Step 1: Prepare Your Project

Create the following folder structure:

```
zoho-projects-proxy/
├── api/
│   └── index.js          # Main serverless function
├── package.json
├── vercel.json
├── .gitignore
└── README.md
```

### Step 2: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 3: Initialize Project

```bash
# Create project folder
mkdir zoho-projects-proxy
cd zoho-projects-proxy

# Create api folder
mkdir api

# Initialize npm
npm init -y

# Install dependencies
npm install axios

# Install Vercel CLI as dev dependency
npm install --save-dev vercel
```

### Step 4: Create Files

Copy the provided files:
- `api/index.js` - Main API handler
- `package.json` - Dependencies
- `vercel.json` - Vercel configuration
- `.gitignore` - Git ignore rules

### Step 5: Login to Vercel

```bash
vercel login
```

Choose your login method (GitHub, GitLab, Bitbucket, or Email)

### Step 6: Deploy to Vercel

```bash
# First deployment (follow prompts)
vercel

# For production deployment
vercel --prod
```

During deployment, Vercel will ask:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account
- **Link to existing project?** → No
- **Project name?** → zoho-projects-proxy (or your choice)
- **Directory?** → ./ (current directory)
- **Override settings?** → No

### Step 7: Add Environment Variables

**Option A: Via Vercel Dashboard (Recommended)**

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

```
ZOHO_CLIENT_ID = YOUR_NEW_CLIENT_ID
ZOHO_CLIENT_SECRET = YOUR_NEW_CLIENT_SECRET
ZOHO_REFRESH_TOKEN = YOUR_NEW_REFRESH_TOKEN
ZOHO_PORTAL_ID = 907432121
```

**Option B: Via CLI**

```bash
vercel env add ZOHO_CLIENT_ID
# Paste your client ID when prompted

vercel env add ZOHO_CLIENT_SECRET
# Paste your client secret

vercel env add ZOHO_REFRESH_TOKEN
# Paste your refresh token

vercel env add ZOHO_PORTAL_ID
# Enter: 907432121
```

After adding env vars, redeploy:
```bash
vercel --prod
```

### Step 8: Get Your API URL

After deployment, Vercel will give you a URL like:
```
https://zoho-projects-proxy.vercel.app
```

Or find it at: https://vercel.com/dashboard → Your Project → Domains

### Step 9: Test Your API

Test the endpoints:

```bash
# Get projects
curl https://your-app.vercel.app/api/projects

# Search projects
curl https://your-app.vercel.app/api/projects/search?query=test

# Get tasks for a project
curl https://your-app.vercel.app/api/projects/PROJECT_ID/tasks
```

## 🔧 API Endpoints

Your Vercel deployment supports:

- `GET /api/projects` - Get all projects
- `GET /api/projects/search?query=xxx` - Search projects
- `GET /api/projects/:projectId/tasks` - Get tasks
- `GET /api/projects/:projectId/bugs` - Get bugs
- `POST /api/projects/:projectId/tasks` - Create task
- `POST /api/projects/:projectId/bugs` - Create bug
- `GET /api/users` - Get portal users

## 🔐 Security Notes

### ⚠️ CRITICAL: Revoke Old Credentials

Your exposed credentials MUST be revoked:

1. Go to https://api-console.zoho.com/
2. Find your current client
3. Delete it
4. Create a new self-client
5. Generate new credentials
6. Use the NEW credentials in Vercel

### Update CORS Settings

In `api/index.js`, update the CORS origin:

```javascript
'Access-Control-Allow-Origin': 'https://salesiq.zoho.com', // Your actual domain
```

Or for multiple domains:

```javascript
const allowedOrigins = [
  'https://cliq.zoho.com',
  'https://salesiq.zoho.com'
];

const origin = req.headers.origin;
if (allowedOrigins.includes(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin);
}
```

## 🔄 Update Your Cliq Widget

Update the proxy URL in all your handlers:

```javascript
// Old (INSECURE)
zoho_client_id = "1000.3R6RRTKL8QESD39LNHKSPGBAAQHOLO";
// ... direct API calls

// New (SECURE)
proxy_server_url = "https://zoho-projects-proxy.vercel.app/api";

// Use proxy for all calls
projects_response = invokeurl [
    url: proxy_server_url + "/projects"
    type: GET
];
```

## 📊 Monitoring & Logs

View logs in Vercel Dashboard:
1. Go to your project
2. Click **Deployments**
3. Click on a deployment
4. View **Functions** tab for logs

## 🚀 Continuous Deployment

### With Git (Recommended)

1. Create a GitHub/GitLab repository
2. Push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

3. Connect to Vercel:
   - Go to Vercel Dashboard
   - Import your Git repository
   - Vercel will auto-deploy on every push

### Environment Variables in Git

Never commit `.env` files! Your `.gitignore` should include:

```
node_modules/
.env
.env.local
.vercel
```

## 🐛 Troubleshooting

### Issue: "Authentication failed"
- Check environment variables in Vercel dashboard
- Ensure credentials are not expired
- Verify credentials are correct

### Issue: "CORS error"
- Update `Access-Control-Allow-Origin` in `api/index.js`
- Redeploy after changes

### Issue: "Function timeout"
- Vercel free tier has 10s timeout
- Consider upgrading for longer timeouts
- Optimize API calls

### Issue: "Rate limiting"
- Zoho has API rate limits
- Implement caching (consider Vercel KV)
- Add request throttling

## 💡 Production Improvements

### 1. Add Redis/KV for Token Caching

```bash
# Add Vercel KV
vercel link
vercel env pull
npm install @vercel/kv
```

### 2. Add Rate Limiting

```javascript
// Use vercel-rate-limit or similar
const rateLimit = require('express-rate-limit');
```

### 3. Add Request Validation

```javascript
// Validate inputs before proxying
if (!projectId || !/^\d+$/.test(projectId)) {
  return res.status(400).json({ error: 'Invalid project ID' });
}
```

### 4. Add Logging

```javascript
// Use services like Logtail, Datadog, etc.
console.log(`API call: ${method} ${pathStr}`);
```

## 📝 Next Steps

1. ✅ Deploy to Vercel
2. ✅ Add environment variables
3. ✅ Test all endpoints
4. ✅ Revoke old credentials
5. ✅ Update Cliq widget with new proxy URL
6. ✅ Update CORS settings
7. ✅ Monitor logs
8. ✅ Set up Git for continuous deployment

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- Zoho Projects API: https://www.zoho.com/projects/help/rest-api/
- Issues: Check Vercel function logs

---

**Remember:** Your API keys should NEVER be in your code. Always use environment variables!