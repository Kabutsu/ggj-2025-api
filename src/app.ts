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
import postsRouter from './routes/posts';

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

// socket setup
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('like', ({ postId }) => {
    console.log('liked: ' + postId);
    io.emit('liked', { postId });
  });

  socket.on('unlike', ({ postId }) => {
    console.log('unliked: ' + postId);
    io.emit('unliked', { postId });
  });

  socket.on('dislike', ({ postId }) => {
    console.log('disliked: ' + postId);
    io.emit('disliked', { postId });
  });

  socket.on('undislike', ({ postId }) => {
    console.log('undisliked: ' + postId);
    io.emit('undisliked', { postId });
  });
  
  socket.on('comment', (msg) => {
    console.log('comment: ' + msg);
    io.emit('comment', msg);
  });

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
