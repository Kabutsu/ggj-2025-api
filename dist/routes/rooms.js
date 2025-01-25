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
            include: { users: true },
        });
        if (room) {
            const user = yield prisma.user.create({
                data: {
                    name,
                    roomId: room.id,
                    sentiment: 50,
                    profileUrl,
                },
            });
            res.json(user);
        }
        else {
            res.status(404).send('Room not found');
        }
    }
    catch (err) {
        res.status(500).send('Error joining room');
    }
}));
// Route to assign traitor
router.post('/assign-traitor', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    try {
        const user = yield prisma.user.update({
            where: { id },
            data: {
                isTraitor: true,
            },
        });
        res.json(user);
    }
    catch (err) {
        res.status(500).send('Error assigning traitor');
    }
}));
exports.default = router;
