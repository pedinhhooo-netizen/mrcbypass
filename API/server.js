const express   = require('express');
const cors      = require('cors');
const http      = require('http');
const WebSocket = require('ws');

// ─────────────────────────────────────────────────────────────────────────────
//  Setup
// ─────────────────────────────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);
const wss    = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────────────────────────────────────
//  Health check — o site faz ping aqui a cada 5min pra Render não dormir
// ─────────────────────────────────────────────────────────────────────────────
app.get('/ping', (req, res) => res.json({ ok: true, ts: Date.now() }));

// ─────────────────────────────────────────────────────────────────────────────
//  Rooms
// ─────────────────────────────────────────────────────────────────────────────
const rooms = new Map();

function generateCode() {
  let code;
  do { code = Math.floor(100000 + Math.random() * 900000).toString(); }
  while (rooms.has(code));
  return code;
}

function createRoom(code) {
  rooms.set(code, {
    remote:  null,
    clients: new Set(),
    state: {
      aimHead: false, aimLegit: false, aimScope: false,
      precision: false, pixelEstendido: false,
      noRecoil: false, chams: false, loaded: false,
    },
  });
  return rooms.get(code);
}

function broadcastToClients(room, msg) {
  const data = JSON.stringify(msg);
  for (const client of room.clients) {
    if (client.readyState === WebSocket.OPEN) client.send(data);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  WebSocket
// ─────────────────────────────────────────────────────────────────────────────
wss.on('connection', (ws) => {
  ws.roomCode = null;
  ws.role     = null; // 'remote' | 'client'

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }

    // Remote (EXE) se registra
    if (msg.type === 'remote_hello') {
      const code = generateCode();
      const room = createRoom(code);
      room.remote = ws;
      ws.roomCode = code;
      ws.role     = 'remote';
      console.log(`[+] Remote conectado — código: ${code}`);
      ws.send(JSON.stringify({ type: 'your_code', code }));
      return;
    }

    // Site entra numa sala
    if (msg.type === 'client_join') {
      const code = msg.code;
      if (!rooms.has(code)) {
        ws.send(JSON.stringify({ type: 'error', message: 'Código inválido ou Remote offline.' }));
        return;
      }
      const room = rooms.get(code);
      if (!room.remote || room.remote.readyState !== WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'error', message: 'Remote offline. Aguarde o EXE estar conectado.' }));
        return;
      }
      room.clients.add(ws);
      ws.roomCode = code;
      ws.role     = 'client';
      console.log(`[+] Cliente entrou na sala ${code}`);
      ws.send(JSON.stringify({ type: 'joined', state: room.state }));
      room.remote.send(JSON.stringify({ type: 'client_connected' }));
      return;
    }

    // Comandos / toggles do site → Remote
    if (msg.type === 'command' || msg.type === 'toggle') {
      const code = ws.roomCode;
      if (!code || !rooms.has(code) || ws.role !== 'client') return;
      const room = rooms.get(code);

      if (msg.type === 'toggle' && msg.feature !== undefined)
        room.state[msg.feature] = msg.state;
      if (msg.type === 'command' && msg.command === 'load')
        room.state.loaded = true;
      if (msg.type === 'command' && msg.command === 'destruct')
        room.state.loaded = false;

      if (room.remote?.readyState === WebSocket.OPEN)
        room.remote.send(JSON.stringify(msg));
      return;
    }

    // Estado atualizado vindo do Remote
    if (msg.type === 'state_update') {
      const code = ws.roomCode;
      if (!code || !rooms.has(code) || ws.role !== 'remote') return;
      const room = rooms.get(code);
      if (msg.state) Object.assign(room.state, msg.state);
      broadcastToClients(room, { type: 'state', state: room.state });
      return;
    }
  });

  ws.on('close', () => {
    const code = ws.roomCode;
    if (!code || !rooms.has(code)) return;
    const room = rooms.get(code);

    if (ws.role === 'remote') {
      console.log(`[-] Remote desconectado — sala ${code} encerrada`);
      broadcastToClients(room, { type: 'remote_disconnected' });
      rooms.delete(code);
    } else if (ws.role === 'client') {
      room.clients.delete(ws);
      console.log(`[-] Cliente saiu da sala ${code} (restam ${room.clients.size})`);
      if (room.remote?.readyState === WebSocket.OPEN)
        room.remote.send(JSON.stringify({ type: 'client_disconnected' }));
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  REST
// ─────────────────────────────────────────────────────────────────────────────
app.get('/check/:code', (req, res) => {
  const room = rooms.get(req.params.code);
  res.json({ valid: !!(room?.remote?.readyState === WebSocket.OPEN) });
});

app.get('/rooms', (req, res) => {
  const list = [];
  for (const [code, room] of rooms) {
    list.push({ code, remoteOnline: room.remote?.readyState === WebSocket.OPEN, clients: room.clients.size });
  }
  res.json(list);
});

// ─────────────────────────────────────────────────────────────────────────────
//  Start
// ─────────────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════╗`);
  console.log(`║  Remote MRC V3 — API             ║`);
  console.log(`║  http://localhost:${PORT}           ║`);
  console.log(`╚══════════════════════════════════╝\n`);
});
