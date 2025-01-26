import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';

const prisma = new PrismaClient();
const router = express.Router();

const LIKE_VALUE = 5;
const DISLIKE_VALUE = 10;
const COMMENT_VALUE = 3;

const createPostsRouter = (io: Server) => {
  /* GET posts listing. */
  router.get('/:roomId', async (req: Request, res: Response, next: NextFunction) => {
    const roomId = req.params.roomId;
    try {
      const posts = await prisma.post.findMany({
        where: { roomId },
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
        orderBy: {
          createdAt: 'desc',
        }
      });
      res.json(posts);
    } catch (error) {
      next(error);
    }
  });

  /* GET post by ID. */
  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    try {
      const post = await prisma.post.findUnique({
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
      } else {
        res.status(404).json({ message: 'Post not found' });
      }
    } catch (error) {
      next(error);
    }
  });

  /* POST create a new post. */
  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    const { userId, roomId, content } = req.body;

    // Check if userId is provided
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    try {
      const post = await prisma.post.create({
        data: {
          content,
          User: {
            connect: {
              id: userId,
            },
          },
          Room: {
            connect: {
              id: roomId,
            },
          },
        },
      });
      res.status(201).json(post);
    } catch (error) {
      console.log(error);
      next(error);
    }
  });

  /* PUT update a post by ID. */
  router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const { content } = req.body;

    try {
      const post = await prisma.post.update({
        where: { id },
        data: { content },
      });
      res.json(post);
    } catch (error) {
      if ((error as any).code === 'P2025') {
        res.status(404).json({ message: 'Post not found' });
      } else {
        next(error);
      }
    }
  });

  /* DELETE delete a post by ID. */
  router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    try {
      await prisma.post.delete({
        where: { id },
      });
      res.json({ message: 'Post deleted' });
    } catch (error) {
      if ((error as any).code === 'P2025') {
        res.status(404).json({ message: 'Post not found' });
      } else {
        next(error);
      }
    }
  });

  /* POST like a post by ID. */
  router.post('/:id/like', async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const { userId } = req.body;

    try {
      const like = await prisma.like.create({
        data: {
          postId: id,
          userId,
        },
      });

      const user = await prisma.user.findFirstOrThrow({
        where: { posts: { some: { id } } },
      });

      io.emit('sentiment', { userId: user.id, sentiment: user.sentiment + LIKE_VALUE });

      await prisma.user.update({
        where: { id: user.id },
        data: {
          sentiment: {
            increment: LIKE_VALUE,
          },
        },
      });
      res.json(like);
    } catch (error) {
      next(error);
    }
  });

  /* POST unlike a post by ID. */
  router.post('/:id/unlike', async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const { userId } = req.body;

    try {
      const like = await prisma.like.findFirstOrThrow({
        where: {
          postId: id,
          userId,
        },
      });

      const user = await prisma.user.findFirstOrThrow({
        where: { posts: { some: { id } } },
      });
      
      io.emit('sentiment', { userId: user.id, sentiment: user.sentiment - LIKE_VALUE });

      await prisma.user.update({
        where: { id: user.id },
        data: {
          sentiment: {
            decrement: LIKE_VALUE,
          },
        },
      });

      await prisma.like.delete({
        where: { id: like.id },
      });
      res.json(like);
    } catch (error) {
      next(error);
    }
  });

  /* POST dislike a post by ID. */
  router.post('/:id/dislike', async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const { userId } = req.body;

    try {
      const dislike = await prisma.dislike.create({
        data: {
          postId: id,
          userId,
        },
      });

      const user = await prisma.user.findFirstOrThrow({
        where: { posts: { some: { id } } },
      });

      io.emit('sentiment', { userId: user.id, sentiment: user.sentiment - DISLIKE_VALUE });

      await prisma.user.update({
        where: { id: user.id },
        data: {
          sentiment: {
            decrement: DISLIKE_VALUE,
          },
        },
      });

      res.json(dislike);
    } catch (error) {
      next(error);
    }
  });

  /* POST undislike a post by ID. */
  router.post('/:id/undislike', async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const { userId } = req.body;

    try {
      const dislike = await prisma.dislike.findFirstOrThrow({
        where: {
          postId: id,
          userId,
        },
      });

      const user = await prisma.user.findFirstOrThrow({
        where: { posts: { some: { id } } },
      });

      io.emit('sentiment', { userId: user.id, sentiment: user.sentiment + DISLIKE_VALUE });

      await prisma.user.update({
        where: { id: user.id },
        data: {
          sentiment: {
            increment: DISLIKE_VALUE,
          },
        },
      });

      await prisma.dislike.delete({
        where: { id: dislike.id },
      });

      res.json(dislike);
    } catch (error) {
      next(error);
    }
  });

  /* POST create a new comment for a post by ID. */
  router.post('/:id/comments', async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.id;
    const { userId, content } = req.body;

    try {
      const comment = await prisma.comment.create({
        data: {
          content,
          postId,
          userId,
        },
        include: {
          User: true,
        },
      });

      const user = await prisma.user.findFirstOrThrow({
        where: { posts: { some: { id: postId } } },
      });

      io.emit('sentiment', { userId: user.id, sentiment: user.sentiment + COMMENT_VALUE });

      await prisma.user.update({
        where: { id: user.id },
        data: {
          sentiment: {
            increment: COMMENT_VALUE,
          },
        },
      });

      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  });

  /* DELETE delete a comment by ID. */
  router.delete('/:postId/comments/:commentId', async (req: Request, res: Response, next: NextFunction) => {
    const commentId = req.params.commentId;

    try {
      await prisma.comment.delete({
        where: { id: commentId },
      });
      res.json({ message: 'Comment deleted' });
    } catch (error) {
      if ((error as any).code === 'P2025') {
        res.status(404).json({ message: 'Comment not found' });
      } else {
        next(error);
      }
    }
  });

  return router;
};

export default createPostsRouter;
