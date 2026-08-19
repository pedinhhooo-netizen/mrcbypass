const express   = require('express');
const cors      = require('cors');
const http      = require('http');
const WebSocket = require('ws');

const app    = express();
const server = http.createServer(app);
const wss    = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

app.get('/ping', (req, res) => res.json({ ok: true, ts: Date.now() }));

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
      // ── Aimbot ──────────────────────────────────────────────────────────
      aimbotMemory:       false,
      aimbotLegit:        false,
      aimbotNeck:         false,
      precision:          false,
      aimbotIgnoreKnocked:false,
      aimbotTargetNPC:    false,
      aimbotDelayMode:    0,       // 0-6
      aimbotMaxDistance:  300,

      // ── ESP ─────────────────────────────────────────────────────────────
      espEnabled:         false,
      espBox:             false,
      espSnapLines:       false,
      espHealthBar:       false,
      espName:            false,
      espDistance:        false,
      espWeapon:          false,
      chams:              false,
      espBoxStyle:        0,       // 0=Full 1=Cornered
      espSnapLinesPos:    0,       // 0=Top 1=Bottom
      espHealthBarPos:    0,       // 0=Left 1=Right 2=Top 3=Bottom
      espRenderDistance:  300,

      // ── Exploits ────────────────────────────────────────────────────────
      noRecoil:           false,
      noRecoilStrength:   50.0,
      weaponAttribs:      false,
      weaponAttribsLevel: 3,
      spinBot:            false,
      spinBotSpeed:       5.0,
      silentAim:          false,
      silentAimUseFOV:    false,
      silentAimFOV:       150.0,
      silentAimDistance:  300,
      silentAimHitbox:    0,       // 0=Head 1=Neck 2=Hip
      silentAimTargetBots:false,
      silentAimIgnoreKnocked: false,

      // ── Configs ─────────────────────────────────────────────────────────
      enableMemory:       false,
      streamMode:         false,
      topMost:            false,

      // ── Status ──────────────────────────────────────────────────────────
      loaded:             false,
    },
    logs: [],
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
wss.on('connection', (ws) => {
  ws.roomCode = null;
  ws.role     = null;

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }

    if (msg.type === 'remote_hello') {
      const code = generateCode();
      const room = createRoom(code);
      room.remote = ws; ws.roomCode = code; ws.role = 'remote';
      console.log(`[+] Remote conectado — código: ${code}`);
      ws.send(JSON.stringify({ type: 'your_code', code }));
      return;
    }

    if (msg.type === 'client_join') {
      const code = msg.code;
      if (!rooms.has(code)) { ws.send(JSON.stringify({ type: 'error', message: 'Código inválido ou Remote offline.' })); return; }
      const room = rooms.get(code);
      if (!room.remote || room.remote.readyState !== WebSocket.OPEN) { ws.send(JSON.stringify({ type: 'error', message: 'Remote offline.' })); return; }
      room.clients.add(ws); ws.roomCode = code; ws.role = 'client';
      console.log(`[+] Cliente entrou na sala ${code}`);
      ws.send(JSON.stringify({ type: 'joined', state: room.state, logs: room.logs }));
      room.remote.send(JSON.stringify({ type: 'client_connected' }));
      return;
    }

    if (msg.type === 'command' || msg.type === 'toggle' || msg.type === 'set') {
      const code = ws.roomCode;
      if (!code || !rooms.has(code) || ws.role !== 'client') return;
      const room = rooms.get(code);

      if (msg.type === 'toggle' && msg.feature !== undefined)
        room.state[msg.feature] = msg.state;
      if (msg.type === 'set' && msg.feature !== undefined && msg.value !== undefined)
        room.state[msg.feature] = msg.value;
      if (msg.type === 'command' && msg.command === 'load')    room.state.loaded = true;
      if (msg.type === 'command' && msg.command === 'destruct') room.state.loaded = false;

      if (room.remote && room.remote.readyState === WebSocket.OPEN) {
        console.log(`[Relay -> Remote] ${msg.type}: ${msg.feature || msg.command} = ${msg.value !== undefined ? msg.value : msg.state}`);
        room.remote.send(JSON.stringify(msg));
      }
      return;
    }

    if (msg.type === 'state_update') {
      const code = ws.roomCode;
      if (!code || !rooms.has(code) || ws.role !== 'remote') return;
      const room = rooms.get(code);
      if (msg.state) Object.assign(room.state, msg.state);
      broadcastToClients(room, { type: 'state', state: room.state });
      return;
    }

    if (msg.type === 'log') {
      const code = ws.roomCode;
      if (!code || !rooms.has(code) || ws.role !== 'remote') return;
      const room = rooms.get(code);
      const entry = { ts: Date.now(), text: msg.text || '' };
      room.logs.push(entry);
      if (room.logs.length > 500) room.logs.shift();
      broadcastToClients(room, { type: 'log', entry });
      return;
    }

    if (msg.type === 'clear_logs') {
      const code = ws.roomCode;
      if (!code || !rooms.has(code) || ws.role !== 'client') return;
      const room = rooms.get(code);
      room.logs = [];
      broadcastToClients(room, { type: 'logs_cleared' });
      if (room.remote?.readyState === WebSocket.OPEN)
        room.remote.send(JSON.stringify({ type: 'clear_logs' }));
      return;
    }
  });

  ws.on('close', () => {
    const code = ws.roomCode;
    if (!code || !rooms.has(code)) return;
    const room = rooms.get(code);
    if (ws.role === 'remote') {
      console.log(`[-] Remote desconectado — sala ${code}`);
      broadcastToClients(room, { type: 'remote_disconnected' });
      rooms.delete(code);
    } else if (ws.role === 'client') {
      room.clients.delete(ws);
      console.log(`[-] Cliente saiu da sala ${code}`);
      if (room.remote?.readyState === WebSocket.OPEN)
        room.remote.send(JSON.stringify({ type: 'client_disconnected' }));
    }
  });
});

app.get('/check/:code', (req, res) => {
  const room = rooms.get(req.params.code);
  res.json({ valid: !!(room?.remote?.readyState === WebSocket.OPEN) });
});

app.get('/rooms', (req, res) => {
  const list = [];
  for (const [code, room] of rooms)
    list.push({ code, remoteOnline: room.remote?.readyState === WebSocket.OPEN, clients: room.clients.size });
  res.json(list);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════╗`);
  console.log(`║  Remote MRC V3 — API             ║`);
  console.log(`║  http://localhost:${PORT}           ║`);
  console.log(`╚══════════════════════════════════╝\n`);
});
