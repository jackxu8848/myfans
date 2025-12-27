// Simple HTTP server to run MyFans frontend locally
// Usage: node server.js

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Decode URL to handle spaces and special characters
  let filePath = decodeURIComponent('.' + req.url);
  
  // Remove query strings if present
  filePath = filePath.split('?')[0];
  
  if (filePath === './' || filePath === '.') {
    filePath = './login.html';
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  // Handle files with spaces in names - try both encoded and original
  fs.readFile(filePath, (error, content) => {
    if (error) {
      // If file not found and URL had spaces, try alternative encoding
      if (error.code === 'ENOENT' && req.url.includes('%20')) {
        const altPath = '.' + req.url.replace(/%20/g, ' ');
        fs.readFile(altPath, (err, altContent) => {
          if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`<h1>404 - File Not Found</h1><p>Requested: ${req.url}</p><p>Tried: ${filePath}</p>`, 'utf-8');
          } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(altContent, 'utf-8');
          }
        });
      } else if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`<h1>404 - File Not Found</h1><p>Requested: ${req.url}</p><p>Tried: ${filePath}</p>`, 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`, 'utf-8');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 MyFans Frontend Server running at:`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`\n   Open your browser and navigate to:`);
  console.log(`   http://localhost:${PORT}/login.html\n`);
});

