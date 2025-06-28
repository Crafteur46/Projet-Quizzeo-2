import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const register: RequestHandler = async (req, res) => {
  const { pseudo, password } = req.body;

  if (!pseudo || !password) {
    res.status(400).json({ message: 'Pseudo and password are required' });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { pseudo } });
    if (existingUser) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        pseudo,
        password: hashedPassword,
      },
    });
    res.status(201).json({ message: 'User created successfully', userId: user.id });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const login: RequestHandler = async (req, res) => {
  const { pseudo, password } = req.body;

  if (!pseudo || !password) {
    res.status(400).json({ message: 'Pseudo and password are required' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { pseudo } });

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET n'est pas défini dans le fichier .env");
      res.status(500).json({ message: 'Erreur interne du serveur.' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};
