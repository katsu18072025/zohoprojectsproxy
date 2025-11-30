# Zoho Projects Manager - SalesIQ Widget

A secure, serverless Zoho SalesIQ widget that integrates with Zoho Projects to manage tasks and bugs directly from your customer support interface.

## 🌟 Features

- **📋 Task Management** - View, create, and update tasks across all projects
- **🐛 Bug Tracking** - Report and monitor bugs with severity levels
- **🔍 Project Search** - Quick search and navigation to projects
- **📊 Overview Dashboard** - Real-time statistics of tasks and bugs
- **🔒 Secure Proxy** - API key authentication for enhanced security
- **⚡ Serverless** - Deployed on Vercel for zero-maintenance scalability

## 🏗️ Architecture

```
┌─────────────────┐
│  Zoho SalesIQ   │
│     Widget      │
└────────┬────────┘
         │ API Key Auth
         ▼
┌─────────────────┐
│  Vercel Proxy   │
│   (Node.js)     │
└────────┬────────┘
         │ OAuth 2.0
         ▼
┌─────────────────┐
│ Zoho Projects   │
│      API        │
└─────────────────┘
```

### Why a Proxy?

1. **Security** - OAuth credentials never exposed to the client
2. **Token Management** - Automatic token refresh and caching
3. **Rate Limiting** - Centralized API call management
4. **CORS Handling** - Seamless cross-origin requests

## 🚀 Quick Start

### Prerequisites

- Zoho Projects account
- Zoho SalesIQ account
- Vercel account (free tier works)
- Node.js 18+ (for local development)

### 1. Deploy the Proxy Server

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/katsu18072025/zohoprojectsproxy)

Or manually:

```bash
# Clone the repository
git clone https://github.com/katsu18072025/zohoprojectsproxy.git
cd zohoprojectsproxy

# Install dependencies
npm install

# Deploy to Vercel
vercel --prod
```

### 2. Configure Environment Variables

In your Vercel dashboard, add these environment variables:

```env
ZOHO_CLIENT_ID=your_client_id
ZOHO_CLIENT_SECRET=your_client_secret
ZOHO_REFRESH_TOKEN=your_refresh_token
ZOHO_PORTAL_ID=your_portal_id
API_KEY=your_generated_api_key
```

**Generate a secure API key:**
```powershell
# PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### 3. Install the Widget

1. Go to Zoho SalesIQ → Settings → Developers → Widgets
2. Create a new widget
3. Copy the code from the `/widget` folder:
   - **Detail Handler**: `detail_handler_final.deluge`
   - **Action Handler**: `action_handler_proxy.deluge`
   - **Form Controllers**:
     - Task Form: `taskform_handler.deluge`
     - Bug Form: `bugform_handler.deluge`
     - Search Form: `projectsearch_handler.deluge`

4. Update the API key in each handler:
   ```deluge
   api_key = "YOUR_API_KEY_HERE";
   ```

## 📁 Project Structure

```
zohoprojectsproxy/
├── api/
│   └── index.js              # Vercel serverless function (proxy)
├── widget/
│   ├── detail_handler_final.deluge       # Main widget display
│   ├── action_handler_proxy.deluge       # Action handler
│   ├── taskform_handler.deluge           # Task creation form
│   ├── bugform_handler.deluge            # Bug reporting form
│   └── projectsearch_handler.deluge      # Project search
├── vercel.json               # Vercel configuration
├── package.json              # Dependencies
└── README.md                 # This file
```

## 🔐 Security Features

- **API Key Authentication** - All proxy requests require valid API key
- **OAuth Token Caching** - Tokens cached in memory to reduce API calls
- **No Client-Side Secrets** - All credentials stored server-side
- **CORS Protection** - Configured for specific origins only

## 🛠️ API Endpoints

The proxy server exposes these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects` | GET | List all projects |
| `/api/projects/:id/tasks` | GET/POST | Get or create tasks |
| `/api/projects/:id/bugs` | GET/POST | Get or create bugs |
| `/api/users` | GET | List portal users |

All endpoints require the `x-api-key` header.

## 📊 Widget Features

### Overview Section
- Total projects count
- Total tasks and bugs count
- Quick action buttons

### Task Management
- View all tasks across projects
- Filter by project and status
- Create new tasks with:
  - Priority levels (High/Medium/Low)
  - Status tracking
  - Due dates
  - Assignee selection
  - Estimated hours

### Bug Tracking
- View all bugs with severity indicators
- Report new bugs with:
  - Severity levels (Critical/High/Medium/Low)
  - Status tracking
  - Reporter information
  - Detailed descriptions

### Project Search
- Searchable project dropdown
- Direct links to Zoho Projects UI
- Quick access to tasks and issues

## 🔧 Development

### Local Development

```bash
# Install dependencies
npm install

# Run locally
vercel dev

# Test the proxy
curl -H "x-api-key: YOUR_KEY" http://localhost:3000/api/projects
```

### Testing the Widget

1. Use Zoho SalesIQ's widget preview
2. Test all actions (create task, report bug, search)
3. Verify data appears in Zoho Projects

## 📝 Configuration

### Zoho OAuth Setup

1. Go to [Zoho API Console](https://api-console.zoho.com/)
2. Create a new client (Server-based Application)
3. Add redirect URI: `https://www.zoho.com/projects`
4. Generate refresh token with scope: `ZohoProjects.projects.ALL`

### Widget Customization

Edit the handlers to customize:
- Portal ID (for direct links)
- Task/Bug fields
- Status and priority options
- UI text and emojis

## 🐛 Troubleshooting

### Common Issues

**"Variable 'form' is not defined"**
- Use `arguments.get()` instead of `form.get()` in form handlers

**"401 Unauthorized"**
- Check API key is correctly set in Vercel
- Verify API key matches in widget handlers

**"404 Not Found"**
- Ensure `vercel.json` is deployed
- Check endpoint URLs match proxy routes

## 📄 License

MIT License - feel free to use and modify for your needs.

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📧 Support

For issues or questions:
- Open a GitHub issue
- Check Zoho SalesIQ documentation
- Review Zoho Projects API docs

## 🏆 Cliqtrix 2025

This widget was created for the Zoho Cliqtrix 2025 competition, demonstrating:
- Secure API integration
- Serverless architecture
- Modern development practices
- User-friendly interface design

---

**Built with ❤️ for Zoho Cliqtrix 2025**