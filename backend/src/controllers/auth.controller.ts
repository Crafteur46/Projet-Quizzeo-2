import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const register: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'L\'email et le mot de passe sont requis.' });
    return;
  }

  try {
    const existingUserByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingUserByEmail) {
        res.status(400).json({ message: 'Cet email est déjà utilisé.' });
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    res.status(201).json({ message: 'Utilisateur créé avec succès', userId: user.id });
  } catch (error) {
    res.status(500).json({ message: 'Une erreur est survenue lors de la création de l\'utilisateur.' });
  }
};

export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'L\'email et le mot de passe sont requis.' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
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
        console.error('Login error:', error);
    res.status(500).json({ message: 'Une erreur est survenue.' });
  }
};
