const express = require('express');
const path = require('path');

const app = express();

// Netlify-style functions can send POST bodies; expose raw body + JSON when present.
app.use(express.json({ limit: '2mb' }));
app.use(express.text({ type: '*/*', limit: '2mb' }));

function toNetlifyEvent(req) {
  const queryStringParameters = {};
  for (const [k, v] of Object.entries(req.query || {})) {
    queryStringParameters[k] = Array.isArray(v) ? v.join(',') : String(v);
  }

  let body = null;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    if (typeof req.body === 'string') body = req.body;
    else if (req.body && Object.keys(req.body).length) body = JSON.stringify(req.body);
  }

  return {
    path: req.path,
    httpMethod: req.method,
    headers: Object.fromEntries(Object.entries(req.headers || {}).map(([k, v]) => [k, String(v)])),
    queryStringParameters: Object.keys(queryStringParameters).length ? queryStringParameters : null,
    body,
    isBase64Encoded: false,
  };
}

function sendNetlifyResult(res, result) {
  const statusCode = result?.statusCode ?? 200;
  const headers = result?.headers ?? {};
  let body = result?.body ?? '';

  if (typeof body !== 'string') {
    body = JSON.stringify(body);
    if (!headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/json';
    }
  }

  res.status(statusCode);
  for (const [k, v] of Object.entries(headers)) {
    res.setHeader(k, v);
  }
  res.send(body);
}

app.all('/.netlify/functions/:name', async (req, res) => {
  const name = req.params.name;
  try {
    // All functions are CommonJS .cjs files
    const fnPath = path.join(process.cwd(), 'netlify', 'functions', `${name}.cjs`);
    // require() cache is fine for a container
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const fn = require(fnPath);

    const handler = fn?.handler || fn;
    if (typeof handler !== 'function') {
      return res.status(500).json({ error: `Invalid function export for ${name}` });
    }

    // Node 20 has global fetch; if not, fail loudly.
    const result = await handler(toNetlifyEvent(req), {});
    return sendNetlifyResult(res, result);
  } catch (e) {
    return res.status(500).json({ error: 'Function invocation failed', details: e?.message || String(e) });
  }
});

app.use(serveStatic());

function serveStatic() {
  const serve = require('serve-static');
  return serve(path.join(process.cwd(), 'dist'), {
    index: ['index.html'],
  });
}

// SPA fallback
app.get('/*splat', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

const port = Number(process.env.PORT || 3030);
app.listen(port, '0.0.0.0', () => {
  console.log(`Static + functions server listening on :${port}`);
});
