"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = require("crypto");
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
router.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const room = yield prisma.room.create({
            data: {
                code: (0, crypto_1.randomUUID)().slice(0, 6).toUpperCase(), // Generate a 6-character room code
            }
        });
        res.json(room);
    }
    catch (err) {
        res.status(500).json({ message: 'Error creating room', err });
    }
}));
// Route to join a room
router.post('/join-room', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code, name, profileUrl } = req.body;
    try {
        const room = yield prisma.room.findUnique({
            where: { code },
            include: { users: true, traitors: true }, // Include traitors in the query
        });
        if (room) {
            const existingUser = room.users.find((user) => user.name === name);
            if (existingUser) {
                return res.status(400).send('User already exists in room');
            }
            // Total number of users in the room (including the new one)
            const totalUsers = room.users.length + 1;
            // Number of traitors already in the room
            const totalTraitors = room.traitors.length;
            // Calculate if the user should be a traitor
            let isTraitor = false;
            const traitorThreshold = Math.floor(totalUsers / 7);
            // Ensure 1 in 7 traitor ratio
            if (totalTraitors < traitorThreshold) {
                isTraitor = true; // Ensure this user becomes a traitor if traitor ratio is not met
            }
            else if (Math.random() < 1 / 7) {
                isTraitor = true; // 1 in 7 chance to assign as traitor
            }
            const user = yield prisma.user.create({
                data: {
                    name,
                    roomId: room.id,
                    sentiment: 50,
                    profileUrl,
                    isTraitor, // Assign the traitor status
                },
            });
            console.log(`User ${user.id} joined room ${room.code} with traitor status: ${isTraitor}`);
            res.json(user);
        }
        else {
            res.status(404).send('Room not found');
        }
    }
    catch (err) {
        console.error('Error joining room:', err);
        res.status(500).send('Error joining room');
    }
}));
exports.default = router;
