import { Request, Response } from 'express';
import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateTokens } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { LoginCredentials, RegisterData, AuthResponse } from '../types';

// Registro de usuario
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, username, phone }: RegisterData = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      sendError(res, 'Email already registered', 400);
      return;
    }

    // Hash del password
    const passwordHash = await hashPassword(password);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        username,
        phone,
      },
    });

    // Generar tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      type: 'user',
    });

    const response: AuthResponse = {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        type: 'user',
      },
    };

    sendSuccess(res, response, 'User registered successfully', 201);
  } catch (error) {
    console.error('Register error:', error);
    sendError(res, 'Error registering user', 500);
  }
};

// Login de usuario
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginCredentials = req.body;

    // Buscar usuario
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      sendError(res, 'Invalid credentials', 401);
      return;
    }

    // Verificar password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      sendError(res, 'Invalid credentials', 401);
      return;
    }

    // Generar tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      type: 'user',
    });

    const response: AuthResponse = {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        type: 'user',
      },
    };

    sendSuccess(res, response, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 'Error logging in', 500);
  }
};

// Login de fabricante
export const loginManufacturer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginCredentials = req.body;

    const manufacturer = await prisma.manufacturer.findUnique({ where: { email } });
    if (!manufacturer || !manufacturer.isActive) {
      sendError(res, 'Invalid credentials', 401);
      return;
    }

    const isValidPassword = await comparePassword(password, manufacturer.passwordHash);
    if (!isValidPassword) {
      sendError(res, 'Invalid credentials', 401);
      return;
    }

    const tokens = generateTokens({
      userId: manufacturer.id,
      email: manufacturer.email,
      type: 'manufacturer',
    });

    const response: AuthResponse = {
      ...tokens,
      user: {
        id: manufacturer.id,
        email: manufacturer.email,
        name: manufacturer.name,
        type: 'manufacturer',
      },
    };

    sendSuccess(res, response, 'Login successful');
  } catch (error) {
    console.error('Manufacturer login error:', error);
    sendError(res, 'Error logging in', 500);
  }
};

// Login de super admin
export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginCredentials = req.body;

    const admin = await prisma.superAdmin.findUnique({ where: { email } });
    if (!admin || !admin.isActive) {
      sendError(res, 'Invalid credentials', 401);
      return;
    }

    const isValidPassword = await comparePassword(password, admin.passwordHash);
    if (!isValidPassword) {
      sendError(res, 'Invalid credentials', 401);
      return;
    }

    const tokens = generateTokens({
      userId: admin.id,
      email: admin.email,
      type: 'admin',
    });

    const response: AuthResponse = {
      ...tokens,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        type: 'admin',
      },
    };

    sendSuccess(res, response, 'Login successful');
  } catch (error) {
    console.error('Admin login error:', error);
    sendError(res, 'Error logging in', 500);
  }
};
