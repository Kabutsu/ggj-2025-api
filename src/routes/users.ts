import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

const router = express.Router();
const prisma = new PrismaClient();

export type User = {
  id: string;
  name: string;
  profileUrl: typeof avatars[keyof typeof avatars];
  sentiment: number;
  roomId: string;
  isTraitor: boolean;
};

const avatars = {
  1: '/images/profile_1.png',
  2: '/images/profile_2.png',
} as const;

/* GET users listing. */
router.get('/', function(req: Request, res: Response, next: NextFunction) {
  res.send('respond with a resource');
});

router.post('/register', async (req: Request, res: Response) => {})

export default router;
