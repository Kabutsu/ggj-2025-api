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
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const avatars = {
    1: '/images/profile_1.png',
    2: '/images/profile_2.png',
};
const createUsersRouter = (io) => {
    /* GET users listing. */
    router.get('/', function (req, res, next) {
        res.send('respond with a resource');
    });
    router.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const id = req.params.id;
        try {
            const user = yield prisma.user.findUnique({
                where: { id },
                include: {
                    likes: {
                        include: {
                            Post: {
                                include: {
                                    User: true,
                                }
                            },
                        }
                    },
                    dislikes: {
                        include: {
                            Post: {
                                include: {
                                    User: true,
                                }
                            },
                        }
                    },
                    flaggedBy: true,
                    flags: true,
                    comments: true,
                    posts: true,
                },
            });
            res.json(user);
        }
        catch (error) {
            next(error);
        }
    }));
    router.post('/:id/flag', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const id = req.params.id;
        const { flaggedById } = req.body;
        try {
            const flag = yield prisma.flag.create({
                data: {
                    userId: flaggedById,
                    flaggedById: id,
                },
            });
            io.emit('flagged', flag);
            res.json(flag);
        }
        catch (error) {
            next(error);
        }
    }));
    return router;
};
exports.default = createUsersRouter;
