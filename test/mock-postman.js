#!/usr/bin/env node
/**
 * Minimal mock Postman API for testing the composite action locally in CI.
 *
 * Endpoints:
 * - POST /monitors/:id/run -> returns sync run result with stats
 * - GET  /monitors/:id     -> returns monitor details with lastRun
 */
const http = require('http');
const url = require('url');

const PORT = 4010;

function sendJSON(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function makeRun(id, status = 'success') {
  const now = new Date();
  const startedAt = new Date(now.getTime() - 1234).toISOString();
  const finishedAt = now.toISOString();
  return {
    info: {
      name: `Mock Monitor ${id}`,
      status,
      startedAt,
      finishedAt,
    },
    stats: {
      assertions: { total: 5, failed: 0 },
      requests: { total: 3, failed: 0 },
      runCount: 1,
      errorCount: 0,
      abortedCount: 0,
      responseLatency: 120,
      responseSize: 5120,
    },
    failures: [],
  };
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const m = parsed.pathname.match(/^\/monitors\/([^\/]+)(?:\/(run))?$/);
  if (!m) {
    return sendJSON(res, 404, { error: 'not_found', path: parsed.pathname });
  }
  const id = m[1];
  const isRun = m[2] === 'run';

  // Require API key header to simulate auth
  const apiKey = req.headers['x-api-key'] || req.headers['x-Api-Key'] || req.headers['X-Api-Key'];
  if (!apiKey) {
    return sendJSON(res, 401, { error: 'missing_api_key' });
  }

  if (req.method === 'POST' && isRun) {
    // Always succeed for our CI test
    return sendJSON(res, 200, { run: makeRun(id, 'success') });
  }

  if (req.method === 'GET' && !isRun) {
    return sendJSON(res, 200, { monitor: { name: `Mock Monitor ${id}`, lastRun: makeRun(id, 'success') } });
  }

  return sendJSON(res, 405, { error: 'method_not_allowed' });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Mock Postman API listening on http://127.0.0.1:${PORT}`);
});
