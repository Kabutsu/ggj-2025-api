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
      } else if (Math.random() < 1 / 7) {
        isTraitor = true; // 1 in 7 chance to assign as traitor
      }

      const user = await prisma.user.create({
        data: {
          name,
          roomId: room.id,
          sentiment: 50,
          profileUrl,
          isTraitor, // Assign the traitor status
        },
      });

      console.log(
        `User ${user.id} joined room ${room.code} with traitor status: ${isTraitor}`
      );

      res.json(user);
    } else {
      res.status(404).send('Room not found');
    }
  } catch (err) {
    console.error('Error joining room:', err);
    res.status(500).send('Error joining room');
  }
});

router.get('/:roomId/status', async (req, res) => {
  const roomId = req.params.roomId;

  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { users: true },
    });

    if (room) {
      res.json({
        traitorCount: room.users.filter((user) => user.isTraitor).length,
        blockedUsers: room.users.filter((user) => user.sentiment <= 0),
      });
    } else {
      res.status(404).send('Room not found');
    }
  } catch (err) {
    console.error('Error fetching traitors:', err);
    res.status(500).send('Error fetching traitors');
  }
});

export default router;
