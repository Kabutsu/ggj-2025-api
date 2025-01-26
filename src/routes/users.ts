import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';

const router = express.Router();
const prisma = new PrismaClient();

export type User = {
  id: string;
  name: string;
  profileUrl: typeof avatars[keyof typeof avatars];
  sentiment: number;
  roomId: string;
  isTraitor: boolean;
  flags: number;
};

const avatars = {
  1: '/images/profile_1.png',
  2: '/images/profile_2.png',
} as const;

const createUsersRouter = (io: Server) => {
  /* GET users listing. */
  router.get('/', function(req: Request, res: Response, next: NextFunction) {
    res.send('respond with a resource');
  });

  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    try {
      const user = await prisma.user.findUnique({
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
    } catch (error) {
      next(error);
    }
  });

  type FlagRequest = { flaggedById: string };

  router.post('/:id/flag', async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const { flaggedById } = req.body as FlagRequest;

    try {
      const flag = await prisma.flag.create({
        data: {
          userId: flaggedById,
          flaggedById: id,
        },
      });

      io.emit('flagged', flag);
      res.json(flag);
    } catch (error) {
      next(error);
    }
  });

  return router;
};

export default createUsersRouter;
