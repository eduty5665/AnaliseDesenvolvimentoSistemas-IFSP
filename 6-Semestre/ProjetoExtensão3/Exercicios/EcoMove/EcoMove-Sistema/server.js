const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const port = Number(process.env.PORT || 3000);
const publicDir = path.join(__dirname, 'public');
const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'ecomove.json');

const initialData = {
  profile: { name: 'Visitante', weeklyGoal: 80 },
  trips: [],
  survey: null
};

function readData() {
  try {
    return { ...initialData, ...JSON.parse(fs.readFileSync(dataFile, 'utf8')) };
  } catch {
    return structuredClone(initialData);
  }
}

function writeData(data) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch { reject(new Error('JSON invalido')); }
    });
  });
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'GET' && url.pathname === '/api/data') return send(res, 200, readData());
  if (req.method === 'PUT' && url.pathname === '/api/data') {
    try {
      const body = await parseBody(req);
      writeData(body);
      return send(res, 200, body);
    } catch (error) { return send(res, 400, { error: error.message }); }
  }

  const relativePath = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  const filePath = path.resolve(publicDir, relativePath);
  if (!filePath.startsWith(publicDir) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return send(res, 404, 'Pagina nao encontrada', 'text/plain; charset=utf-8');
  send(res, 200, fs.readFileSync(filePath), mimeTypes[path.extname(filePath)] || 'application/octet-stream');
});

server.listen(port, () => console.log(`EcoMove em http://localhost:${port}`));
