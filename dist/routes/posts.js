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
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
/* GET posts listing. */
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield prisma.post.findMany({
            include: {
                User: true,
                comments: {
                    include: {
                        User: true,
                    },
                },
                likes: true,
                dislikes: true,
            },
        });
        res.json(posts);
    }
    catch (error) {
        next(error);
    }
}));
/* GET post by ID. */
router.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const post = yield prisma.post.findUnique({
            where: { id },
            include: {
                User: true,
                comments: {
                    include: {
                        User: true,
                    },
                },
                likes: true,
                dislikes: true,
            },
        });
        if (post) {
            res.json(post);
        }
        else {
            res.status(404).json({ message: 'Post not found' });
        }
    }
    catch (error) {
        next(error);
    }
}));
/* POST create a new post. */
router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, content } = req.body;
    try {
        const post = yield prisma.post.create({
            data: {
                content,
                userId,
            },
        });
        res.status(201).json(post);
    }
    catch (error) {
        next(error);
    }
}));
/* PUT update a post by ID. */
router.put('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const { content } = req.body;
    try {
        const post = yield prisma.post.update({
            where: { id },
            data: { content },
        });
        res.json(post);
    }
    catch (error) {
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'Post not found' });
        }
        else {
            next(error);
        }
    }
}));
/* DELETE delete a post by ID. */
router.delete('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        yield prisma.post.delete({
            where: { id },
        });
        res.json({ message: 'Post deleted' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'Post not found' });
        }
        else {
            next(error);
        }
    }
}));
/* POST like a post by ID. */
router.post('/:id/like', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const { userId } = req.body;
    try {
        const like = yield prisma.like.create({
            data: {
                postId: id,
                userId,
            },
        });
        res.json(like);
    }
    catch (error) {
        next(error);
    }
}));
/* POST unlike a post by ID. */
router.post('/:id/unlike', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const { userId } = req.body;
    try {
        const like = yield prisma.like.deleteMany({
            where: {
                postId: id,
                userId,
            },
        });
        res.json({ message: 'Like removed' });
    }
    catch (error) {
        next(error);
    }
}));
/* POST dislike a post by ID. */
router.post('/:id/dislike', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const { userId } = req.body;
    try {
        const dislike = yield prisma.dislike.create({
            data: {
                postId: id,
                userId,
            },
        });
        res.json(dislike);
    }
    catch (error) {
        next(error);
    }
}));
/* POST undislike a post by ID. */
router.post('/:id/undislike', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const { userId } = req.body;
    try {
        const dislike = yield prisma.dislike.deleteMany({
            where: {
                postId: id,
                userId,
            },
        });
        res.json({ message: 'Dislike removed' });
    }
    catch (error) {
        next(error);
    }
}));
/* POST create a new comment for a post by ID. */
router.post('/:id/comments', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.id;
    const { userId, content } = req.body;
    try {
        const comment = yield prisma.comment.create({
            data: {
                content,
                postId,
                userId,
            },
        });
        res.status(201).json(comment);
    }
    catch (error) {
        next(error);
    }
}));
/* DELETE delete a comment by ID. */
router.delete('/:postId/comments/:commentId', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const commentId = req.params.commentId;
    try {
        yield prisma.comment.delete({
            where: { id: commentId },
        });
        res.json({ message: 'Comment deleted' });
    }
    catch (error) {
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'Comment not found' });
        }
        else {
            next(error);
        }
    }
}));
exports.default = router;
