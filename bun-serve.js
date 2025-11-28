// Simple Bun server with proxy for CoinGecko API
const { serve, fetch } = require("bun");

const DEFAULT_PORT = parseInt(process.env.PORT || '8080', 10);
const PORT_CANDIDATES = [DEFAULT_PORT, DEFAULT_PORT + 1, DEFAULT_PORT + 2];

function startServer(port) {
  try {
    return serve({
      port,
      async fetch(req) {
    const url = new URL(req.url);

    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    };

    // Handle OPTIONS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders
      });
    }

    // Proxy API requests to avoid CORS
    if (url.pathname.startsWith('/api/')) {
      // Remove /api prefix and use as /api/v3 for CoinGecko
      const apiPath = url.pathname.replace('/api', '/api/v3');
      const apiUrl = `https://api.coingecko.com${apiPath}${url.search}`;

      try {
        console.log(`Proxying API request to: ${apiUrl}`);
        const apiResponse = await fetch(apiUrl, {
          method: req.method,
          headers: {
            'User-Agent': 'CryptoFolio Pro/1.0 (contact@example.com)',
            'Accept': 'application/json',
            'CG-Pricing-Feature': 'true'
          }
        });

        if (!apiResponse.ok) {
          return new Response(JSON.stringify({ error: 'API Error' }), {
            status: apiResponse.status,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          });
        }

        const data = await apiResponse.json();
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=60' // Cache for 1 minute
          }
        });
      } catch (error) {
        console.error('API proxy error:', error);
        return new Response(JSON.stringify({ error: 'Proxy Error' }), {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
    }

    // Serve static files
    let filePath = url.pathname === '/' ? '/index.html' : url.pathname;

    // Prevent directory traversal
    if (filePath.includes('..')) {
      return new Response('Forbidden', {
        status: 403,
        headers: corsHeaders
      });
    }

    try {
      const file = Bun.file(`.${filePath}`);
      const exists = await file.exists();

      if (!exists) {
        // Try with .json extension for cp.json
        if (filePath === '/cp' || filePath === '/cp.json') {
          const jsonFile = Bun.file('./cp.json');
          if (await jsonFile.exists()) {
            return new Response(jsonFile, {
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            });
          }
        }

        return new Response('File not found', {
          status: 404,
          headers: corsHeaders
        });
      }

      const ext = filePath.split('.').pop()?.toLowerCase();
      const contentTypes = {
        'html': 'text/html; charset=utf-8',
        'css': 'text/css; charset=utf-8',
        'js': 'application/javascript; charset=utf-8',
        'json': 'application/json; charset=utf-8',
        'ico': 'image/x-icon',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'svg': 'image/svg+xml'
      };

      return new Response(file, {
        headers: {
          ...corsHeaders,
          'Content-Type': contentTypes[ext] || 'text/plain; charset=utf-8'
        }
      });
    } catch (error) {
      console.error('File serving error:', error);
      return new Response('Internal Server Error', {
        status: 500,
        headers: corsHeaders
      });
    }
      }
    });
  } catch (error) {
    if (error && error.code === 'EADDRINUSE') {
      console.warn(`Port ${port} in use, trying next...`);
      return null;
    }
    throw error;
  }
}

let server = null;
for (const port of PORT_CANDIDATES) {
  server = startServer(port);
  if (server) break;
}

if (!server) {
  console.error(`Unable to start server on ports: ${PORT_CANDIDATES.join(', ')}`);
  process.exit(1);
}

console.log('\n🚀 CryptoFolio Pro Server');
console.log(`📍 Local: http://localhost:${server.port}`);
console.log('🔥 Hot reload enabled');
console.log('⚡ Powered by Bun\n');
