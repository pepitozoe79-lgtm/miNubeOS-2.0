import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { initDB } from './db/init';
import { setupSystemSocket } from './sockets/system';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

initDB().then(() => {
  setupSystemSocket(io);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`🚀 API corriendo en http://localhost:${PORT}`);
  });
});
