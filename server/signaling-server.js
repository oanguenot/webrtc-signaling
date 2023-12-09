const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const bodyParser = require('body-parser')

const app = express();
app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = {};
let method = null;

// Start the server.
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});


/**
 * WebSocket Events
 */
wss.on('connection', (ws) => {
  // Handle incoming messages from clients.
  method = "socket";
  console.log(`${method}: New client connected`);

  ws.on('message', (message) => {
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

/**
 * SSE Events
 * Register a new client
 */
app.get('/api/events', (req, res) => {
  const name = req.query.name;

  method = "sse"; // Set the method to SSE
  console.log(`${method}: New client ${name} connected`);

  // Store the response object in order to send event to the right user
  clients[name] = res;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  res.write('event: connected\n');
  res.write(`data: ""\n\n`);

  const interval = setInterval(() => {
    res.write('event: ping\n');
    res.write(`data: ${new Date().toISOString()}\n\n`);
  }, 10000);

  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

/**
 * Stream Events
 * Register a new client
 */
app.get('/stream', (req, res) => {

  const name = req.query.name;

  method = "stream";
  console.log(`${method}: New client ${name} connected`);

  // Store the response object in order to send event to the right user
  clients[name] = res;

  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Transfer-Encoding': 'chunked',
    'X-Content-Type-Options': 'nosniff'
  });

  res.write('{"stream":"connected"}');

  req.on('close', () => {
    console.log("Client disconnected");
    res.end();
  });
});

/**
 * REST API for signaling
 */
app.post('/api/signaling', (req, res) => {
  const data = req.body;
  const client = clients[data.to];
  if (client) {
    if(method === "sse") {
      client.write(`event: signaling\n`);
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    }
    else  {
      client.write(JSON.stringify(data) + "\n");
    }
  }
  res.status(200).send();
});



