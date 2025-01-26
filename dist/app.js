"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const index_1 = __importDefault(require("./routes/index"));
const users_1 = __importDefault(require("./routes/users"));
const posts_1 = __importDefault(require("./routes/posts"));
const rooms_1 = __importDefault(require("./routes/rooms"));
var app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
    }
});
// view engine setup
app.use(logger('dev'));
app.use(cors());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express_1.default.static(path.join(__dirname, 'public')));
app.use('/', index_1.default);
app.use('/users', users_1.default);
app.use('/posts', (0, posts_1.default)(io));
app.use('/rooms', rooms_1.default);
// socket setup
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('like', (data) => {
        console.log('liked: ' + data.postId);
        io.emit('liked', data);
    });
    socket.on('unlike', (data) => {
        console.log('unliked: ' + data.postId);
        io.emit('unliked', data);
    });
    socket.on('dislike', (data) => {
        console.log('disliked: ' + data.postId);
        io.emit('disliked', data);
    });
    socket.on('undislike', (data) => {
        console.log('undisliked: ' + data.postId);
        io.emit('undisliked', data);
    });
    socket.on('comment', (msg) => {
        console.log('comment: ' + msg);
        io.emit('comment', msg);
    });
    socket.on('join-room', ({ roomCode, userId }) => {
        socket.join(roomCode);
        io.to(roomCode).emit('user-joined', { userId });
        console.log(`${userId} joined room ${roomCode}`);
    });
    socket.on('post', ({ roomCode, userId, message }) => {
        io.to(roomCode).emit('posted', { userId, message });
        console.log(`User ${userId} posted in room ${roomCode}`);
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
app.use(function (req, res, next) {
    next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
    // send JSON error response
    res.status(err.status || 500).json({
        message: err.message,
        error: req.app.get('env') === 'development' ? err : {},
    });
});
module.exports = app;
