const { serve } = require("bun");

const DEFAULT_PORT = parseInt(process.env.PORT || '8080', 10);
const PORT_CANDIDATES = [DEFAULT_PORT, DEFAULT_PORT + 1, DEFAULT_PORT + 2];

function startServer(port) {
  try {
    return serve({
      port,
      fetch(req) {
    const url = new URL(req.url);
    console.log(`Request: ${req.method} ${url.pathname}`);

    // Set CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    // Handle OPTIONS requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    // Serve static files
    let filePath = '.' + url.pathname;
    if (filePath === './') {
      filePath = './index.html';
    }

    // Try different extensions if not found
    if (!filePath.includes('.')) {
      const possibleExtensions = ['', '.html', '.json'];
      for (const ext of possibleExtensions) {
        const testPath = filePath + ext;
        try {
          const file = Bun.file(testPath);
          if (await file.exists()) {
            filePath = testPath;
            break;
          }
        } catch (e) {}
      }
    }

    try {
      const file = Bun.file(filePath);
      const exists = await file.exists();

      if (!exists) {
        console.log(`File not found: ${filePath}`);
        return new Response('File not found', { status: 404, headers });
      }

      // Determine content type
      const ext = filePath.split('.').pop().toLowerCase();
      const contentTypes = {
        'html': 'text/html',
        'css': 'text/css',
        'js': 'application/javascript',
        'json': 'application/json',
        'svg': 'image/svg+xml',
        'ico': 'image/x-icon'
      };

      const contentType = contentTypes[ext] || 'text/plain';
      headers['Content-Type'] = contentType;

      const response = new Response(file, { headers });
      console.log(`Serving: ${filePath} as ${contentType}`);
      return response;
    } catch (error) {
      console.error('Error serving file:', error);
      return new Response('Internal Server Error', { status: 500, headers });
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

console.log(`🚀 CryptoFolio Pro server running at http://localhost:${server.port}`);
console.log(`📊 Open your browser to: http://localhost:${server.port}`);
console.log('📁 Serving files from:', process.cwd());
