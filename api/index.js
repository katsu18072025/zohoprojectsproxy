// api/index.js - Main Vercel serverless function
const axios = require('axios');

// In-memory token cache (works for serverless with limitations)
// For production, consider using Vercel KV or Redis
let tokenCache = {
  token: null,
  expiresAt: 0
};

// Get Access Token with caching
async function getAccessToken() {
  // Return cached token if still valid
  if (tokenCache.token && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  try {
    const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
      params: {
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        refresh_token: process.env.ZOHO_REFRESH_TOKEN,
        grant_type: 'refresh_token'
      }
    });

    const token = response.data.access_token;
    const expiresIn = response.data.expires_in || 3600;

    // Cache token (expire 5 minutes early for safety)
    tokenCache = {
      token: token,
      expiresAt: Date.now() + (expiresIn - 300) * 1000
    };

    return token;
  } catch (error) {
    console.error('Token generation failed:', error.response?.data || error.message);
    throw new Error('Authentication failed');
  }
}

// CORS headers
function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*', // Change to specific domain in production
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// Main handler
module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Add CORS headers
  Object.entries(getCorsHeaders()).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // API Key Authentication
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  const validApiKey = process.env.API_KEY;

  if (!validApiKey) {
    return res.status(500).json({ error: 'Server configuration error: API_KEY not set' });
  }

  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing API key' });
  }

  // Extract path from query parameter or URL path
  let { path } = req.query;

  // If no query path, try to extract from URL path
  if (!path || path.length === 0) {
    const urlPath = req.url.split('?')[0]; // Remove query string
    const match = urlPath.match(/\/api\/(.+)/);
    if (match) {
      path = match[1];
    }
  }

  const method = req.method;
  const portalId = process.env.ZOHO_PORTAL_ID;

  try {
    const token = await getAccessToken();

    // Route handler
    let zohoUrl = '';
    let zohoMethod = method;
    let zohoData = null;

    // Parse the path to determine the Zoho API endpoint
    if (!path || path.length === 0) {
      return res.status(400).json({ error: 'Invalid API path. Use /api/projects or /api?path=projects' });
    }

    const pathStr = Array.isArray(path) ? path.join('/') : path;

    // Route: GET /api/projects
    if (pathStr === 'projects' && method === 'GET') {
      zohoUrl = `https://projectsapi.zoho.com/api/v3/portal/${portalId}/projects`;
    }

    // Route: GET /api/projects/:projectId/tasks
    else if (pathStr.match(/^projects\/[\w-]+\/tasks$/) && method === 'GET') {
      const projectId = pathStr.split('/')[1];
      zohoUrl = `https://projectsapi.zoho.com/api/v3/portal/${portalId}/projects/${projectId}/tasks`;
    }

    // Route: GET /api/projects/:projectId/bugs
    else if (pathStr.match(/^projects\/[\w-]+\/bugs$/) && method === 'GET') {
      const projectId = pathStr.split('/')[1];
      zohoUrl = `https://projectsapi.zoho.com/api/v3/portal/${portalId}/projects/${projectId}/bugs?is_desc_needed=true`;
    }

    // Route: POST /api/projects/:projectId/tasks
    else if (pathStr.match(/^projects\/[\w-]+\/tasks$/) && method === 'POST') {
      const projectId = pathStr.split('/')[1];
      zohoUrl = `https://projectsapi.zoho.com/restapi/portal/${portalId}/projects/${projectId}/tasks/`;
      zohoData = req.body;

      // Handle assignee email lookup if provided
      if (zohoData.assignee_email) {
        const assigneeId = await lookupAssigneeByEmail(token, portalId, zohoData.assignee_email);
        if (assigneeId) {
          zohoData.person_responsible = assigneeId;
          zohoData.owner = assigneeId;
        }
        delete zohoData.assignee_email;
      }
    }

    // Route: POST /api/projects/:projectId/bugs
    else if (pathStr.match(/^projects\/[\w-]+\/bugs$/) && method === 'POST') {
      const projectId = pathStr.split('/')[1];
      zohoUrl = `https://projectsapi.zoho.com/restapi/portal/${portalId}/projects/${projectId}/bugs/`;
      zohoData = req.body;
    }

    // Route: GET /api/users
    else if (pathStr === 'users' && method === 'GET') {
      zohoUrl = `https://projectsapi.zoho.com/restapi/portal/${portalId}/users/`;
    }

    // Route: GET /api/projects/search?query=xxx
    else if (pathStr === 'projects/search' && method === 'GET') {
      zohoUrl = `https://projectsapi.zoho.com/api/v3/portal/${portalId}/projects`;
      const searchQuery = req.query.query;

      const response = await axios.get(zohoUrl, {
        headers: { 'Authorization': `Zoho-oauthtoken ${token}` }
      });

      let projects = response.data.projects || response.data;

      // Filter by search query
      if (searchQuery) {
        const searchTerm = searchQuery.toLowerCase();
        projects = projects.filter(p =>
          p.name.toLowerCase().includes(searchTerm)
        );
      }

      return res.status(200).json({ projects });
    }

    else {
      return res.status(404).json({ error: 'Endpoint not found' });
    }

    // Make request to Zoho API
    const zohoResponse = await axios({
      method: zohoMethod,
      url: zohoUrl,
      headers: {
        'Authorization': `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: zohoData
    });

    return res.status(200).json(zohoResponse.data);

  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || 'Internal server error',
      details: error.message
    });
  }
};

// Helper function to lookup assignee by email
async function lookupAssigneeByEmail(token, portalId, email) {
  try {
    const usersUrl = `https://projectsapi.zoho.com/restapi/portal/${portalId}/users/`;
    const response = await axios.get(usersUrl, {
      headers: { 'Authorization': `Zoho-oauthtoken ${token}` }
    });

    if (response.data?.users) {
      for (const u of response.data.users) {
        const userEmail = u.email || u.user?.email;
        if (userEmail && userEmail.toLowerCase() === email.toLowerCase()) {
          return u.id || u.user?.id;
        }
      }
    }
    return null;
  } catch (error) {
    console.error('User lookup failed:', error.message);
    return null;
  }
}