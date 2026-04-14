import http from 'node:http';
import crypto from 'node:crypto';

const PORT = Number(process.env.API_PORT ?? 8787);
const HOST = process.env.API_HOST ?? '127.0.0.1';

const users = new Map([
  [
    'user_01',
    {
      telegramUserId: 123456789,
      username: 'checkers_player',
      firstName: 'Konstantin',
      lastName: 'Ivanov',
      languageCode: 'ru',
    },
  ],
]);

const activeSessions = new Map([
  [
    'session_prod_local_01',
    {
      userId: 'user_01',
      expiresAt: '2099-01-01T00:00:00.000Z',
      issuedAt: '2026-04-14T00:00:00.000Z',
    },
  ],
]);

const requestId = () => crypto.randomUUID();

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload, null, 2));
};

const unauthorized = (res) =>
  sendJson(res, 401, {
    code: 'unauthorized',
    message: 'Missing or invalid session.',
  });

const notFound = (res) =>
  sendJson(res, 404, {
    code: 'not_found',
    message: 'Route not found.',
  });

const parseBearerToken = (authorizationHeader) => {
  if (!authorizationHeader) return null;

  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return null;

  return token.trim();
};

const getSession = (token) => {
  if (!token) return null;

  const session = activeSessions.get(token);
  if (!session) return null;

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    activeSessions.delete(token);
    return null;
  }

  return session;
};

const getCurrentUser = (req) => {
  const token = parseBearerToken(req.headers.authorization);
  const session = getSession(token);
  if (!session) return null;

  return users.get(session.userId) ?? null;
};

/**
 * @openapi
 * /me:
 *   get:
 *     tags: [User]
 *     summary: Get current authenticated user
 *     operationId: getCurrentUser
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       '401':
 *         description: Missing or invalid session
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const handleGetCurrentUser = (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return unauthorized(res);

  return sendJson(res, 200, user);
};

const server = http.createServer((req, res) => {
  const rid = requestId();
  res.setHeader('x-request-id', rid);

  if (req.method === 'GET' && req.url === '/health') {
    return sendJson(res, 200, {
      status: 'ok',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  }

  if (req.method === 'GET' && req.url === '/me') {
    return handleGetCurrentUser(req, res);
  }

  return notFound(res);
});

server.listen(PORT, HOST, () => {
  console.log(`API listening on http://${HOST}:${PORT}`);
  console.log(`Health: curl http://${HOST}:${PORT}/health`);
  console.log(`Profile: curl -H "Authorization: Bearer session_prod_local_01" http://${HOST}:${PORT}/me`);
});
