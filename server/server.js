const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');
const http = require('http');
const chatSocket = require('./sockets/chat.socket');

dotenv.config();
connectDB();

const app = express();

const server = http.createServer(app);

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

chatSocket(io);

const routesPath = path.join(__dirname, 'routes');
fs.readdirSync(routesPath).forEach((file) => {
  if (file.endsWith('.js')) {
    const route = require(path.join(routesPath, file));
    const routePath = '/api/' + file.replace('Routes.js', '').toLowerCase();
    app.use(routePath, route);
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to the Authentication API');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});