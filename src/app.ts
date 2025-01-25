var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const jwt = require('jsonwebtoken');
const cors = require('cors');

import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server } from 'socket.io';

import indexRouter from './routes/index';
import usersRouter from './routes/users';
import postsRouter from './routes/posts'
import roomsRouter from './routes/rooms';
import { Dislike, Like } from '@prisma/client';

var app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

// view engine setup

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/rooms', roomsRouter);

// socket setup
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('like', (data: Like) => {
    console.log('liked: ' + data.postId);
    io.emit('liked', data);
  });

  socket.on('unlike', (data: Like) => {
    console.log('unliked: ' + data.postId);
    io.emit('unliked', data);
  });

  socket.on('dislike', (data: Dislike) => {
    console.log('disliked: ' + data.postId);
    io.emit('disliked', data);
  });

  socket.on('undislike', (data: Dislike) => {
    console.log('undisliked: ' + data.postId);
    io.emit('undisliked', data);
  });
  
  socket.on('comment', (msg) => {
    console.log('comment: ' + msg);
    io.emit('comment', msg);
  });

  socket.on('join-room', ({ roomCode, userId }) => {
    socket.join(roomCode);
    
    // Broadcast to others in the room that a new user has joined
    io.to(roomCode).emit('user-joined', { userId });
    console.log(`${userId} joined room ${roomCode}`);
  });

  socket.on('post', ({ roomCode, userId, message }) => {
    io.to(roomCode).emit('posted', { userId, message });
    console.log(`User ${userId} posted in room ${roomCode}`);
  })

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Socket is listening on port ${PORT}`);
});

// catch 404 and forward to error handler
app.use(function(req: Request, res: Response, next: NextFunction) {
  next(createError(404));
});

// error handler
app.use(function(err: any, req: Request, res: Response, next: NextFunction) {
  // send JSON error response
  res.status(err.status || 500).json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {},
  });
});

module.exports = app;
