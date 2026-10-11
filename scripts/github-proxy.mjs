import http from 'http';
import net from 'net';

const REAL_GITHUB_IPS = {
  'api.github.com': '140.82.121.6',
  'github.com': '140.82.121.4',
};

const server = http.createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('GitHub CONNECT Proxy Active\n');
});

server.on('connect', (req, clientSocket, head) => {
  const [host, port] = req.url.split(':');
  const targetIp = REAL_GITHUB_IPS[host] || host;
  const targetPort = Number(port) || 443;

  const serverSocket = net.connect(targetPort, targetIp, () => {
    clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    serverSocket.write(head);
    serverSocket.pipe(clientSocket);
    clientSocket.pipe(serverSocket);
  });

  serverSocket.on('error', (err) => {
    clientSocket.end(`HTTP/1.1 502 Bad Gateway\r\n\r\n${err.message}`);
  });

  clientSocket.on('error', () => {
    serverSocket.end();
  });
});

const PORT = 8888;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`[Proxy] Running on http://127.0.0.1:${PORT}`);
});
