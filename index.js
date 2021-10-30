const app = require('./app');
const http = require('http');

const PORT = 8000;

const server = http.createServer(app);

server.listen(PORT);
server.on('error', (err) => console.error('Server Error', err));
server.on('listening', () =>
  console.log('\nServer Listening on PORT:', PORT, '\n')
);
