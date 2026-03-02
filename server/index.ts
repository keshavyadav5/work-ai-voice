import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { handleSocketConnection } from './socket-handler';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer((req, res) => {
        const parsedUrl = parse(req.url || '', true);
        const { pathname } = parsedUrl;

        // API Route: Get session data for summary page
        if (pathname?.startsWith('/api/session/')) {
            const sessionId = pathname.split('/').pop();
            const { sessionManager } = require('../src/lib/session');
            const { getScenario } = require('../src/lib/scenarios');

            const session = sessionManager.getSession(sessionId);
            if (!session) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Session not found' }));
                return;
            }

            const scenario = getScenario(session.scenarioId);

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                ...session,
                scenarioName: scenario?.name || 'Unknown',
                companyName: scenario?.companyName || 'Unknown',
                companyBrand: scenario?.companyBrand || 'Unknown',
                requiredFields: scenario?.requiredFields || []
            }));
            return;
        }

        handle(req, res, parsedUrl);
    });

    // Create Socket.io server
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: dev ? '*' : process.env.NEXT_PUBLIC_APP_URL,
            methods: ['GET', 'POST'],
        },
        maxHttpBufferSize: 1e6, // 1MB max for audio chunks
        pingTimeout: 60000,
        pingInterval: 25000,
    });

    // Handle socket connections
    io.on('connection', (socket) => {
        console.log(`[Socket] Client connected: ${socket.id}`);
        handleSocketConnection(socket);
    });

    httpServer.listen(port, () => {
        console.log(`
  🎙️  Voice Agent Server
  ─────────────────────
  > Local:    http://${hostname}:${port}
  > Mode:     ${dev ? 'Development' : 'Production'}
  > Socket:   Ready
    `);
    });
});
