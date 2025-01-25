import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import { User } from './users';

type Room = {
  id: string;
  code: string;
  createdAt: Date;
  users: Array<User>;
  traitors: Array<User>;
};

type JoinRequest = Pick<Room, 'code'> & Pick<User, 'name' | 'profileUrl'>;

type AssignTraitorRequest = Pick<User, 'roomId' | 'id'>;

dotenv.config();

const prisma = new PrismaClient();

const router = express.Router();

router.post('/create', async (req: Request, res: Response) => {
  try {
    const room = await prisma.room.create({
      data: {
        code: randomUUID().slice(0, 6).toUpperCase(), // Generate a 6-character room code
      }
    });

    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Error creating room', err });
  }
});

// Route to join a room
router.post('/join-room', async (req, res) => {
  const { code, name, profileUrl } = req.body as JoinRequest;
  try {
    const room = await prisma.room.findUnique({
      where: { code },
      include: { users: true },
    });

    if (room) {
      const user = await prisma.user.create({
        data: {
          name,
          roomId: room.id,
          sentiment: 50,
          profileUrl,
        },
      });

      console.log(`User ${user.id} joined room ${room.code}`);

      res.json(user);
    } else {
      res.status(404).send('Room not found');
    }
  } catch (err) {
    res.status(500).send('Error joining room');
  }
});

// Route to assign traitor
router.post('/assign-traitor', async (req, res) => {
  const { id } = req.body as AssignTraitorRequest;
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        isTraitor: true,
      },
    });

    res.json(user);
  } catch (err) {
    res.status(500).send('Error assigning traitor');
  }
});

export default router;
