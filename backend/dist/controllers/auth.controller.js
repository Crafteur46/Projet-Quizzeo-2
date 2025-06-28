"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const register = async (req, res) => {
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
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                pseudo,
                password: hashedPassword,
            },
        });
        res.status(201).json({ message: 'User created successfully', userId: user.id });
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.register = register;
const login = async (req, res) => {
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
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
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
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, jwtSecret, { expiresIn: '1h' });
        res.json({ token });
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.login = login;
