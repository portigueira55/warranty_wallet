import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';
import { hashPassword } from '../utils/password';

// Dashboard general
export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalManufacturers, totalWarranties, totalClaims] = await Promise.all([
      prisma.user.count(),
      prisma.manufacturer.count(),
      prisma.warranty.count(),
      prisma.warrantyClaim.count(),
    ]);

    const stats = {
      totalUsers,
      totalManufacturers,
      totalWarranties,
      totalClaims,
    };

    sendSuccess(res, stats);
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    sendError(res, 'Error fetching dashboard', 500);
  }
};

// Lista de usuarios
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        createdAt: true,
        isActive: true,
        _count: {
          select: {
            warranties: true,
            warrantyClaims: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    sendSuccess(res, users);
  } catch (error) {
    console.error('Get users error:', error);
    sendError(res, 'Error fetching users', 500);
  }
};

// Activar/desactivar usuario
export const updateUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
    });

    sendSuccess(res, user, 'User status updated successfully');
  } catch (error) {
    console.error('Update user status error:', error);
    sendError(res, 'Error updating user status', 500);
  }
};

// Lista de fabricantes
export const getManufacturers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const manufacturers = await prisma.manufacturer.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        contactPhone: true,
        website: true,
        createdAt: true,
        isActive: true,
        _count: {
          select: {
            products: true,
            warrantyClaims: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    sendSuccess(res, manufacturers);
  } catch (error) {
    console.error('Get manufacturers error:', error);
    sendError(res, 'Error fetching manufacturers', 500);
  }
};

// Crear fabricante
export const createManufacturer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, contactPhone, supportEmail, website } = req.body;

    // Verificar si ya existe
    const existing = await prisma.manufacturer.findUnique({ where: { email } });
    if (existing) {
      sendError(res, 'Email already registered', 400);
      return;
    }

    const passwordHash = await hashPassword(password);

    const manufacturer = await prisma.manufacturer.create({
      data: {
        name,
        email,
        passwordHash,
        contactPhone,
        supportEmail,
        website,
      },
    });

    sendSuccess(res, manufacturer, 'Manufacturer created successfully', 201);
  } catch (error) {
    console.error('Create manufacturer error:', error);
    sendError(res, 'Error creating manufacturer', 500);
  }
};

// Actualizar fabricante
export const updateManufacturer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, contactPhone, supportEmail, website, logoUrl, isActive } = req.body;

    const manufacturer = await prisma.manufacturer.update({
      where: { id },
      data: {
        name,
        contactPhone,
        supportEmail,
        website,
        logoUrl,
        isActive,
      },
    });

    sendSuccess(res, manufacturer, 'Manufacturer updated successfully');
  } catch (error) {
    console.error('Update manufacturer error:', error);
    sendError(res, 'Error updating manufacturer', 500);
  }
};

// Obtener todas las garantías
export const getAllWarranties = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const warranties = await prisma.warranty.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                manufacturer: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100, // Limitar a 100 más recientes
    });

    sendSuccess(res, warranties);
  } catch (error) {
    console.error('Get all warranties error:', error);
    sendError(res, 'Error fetching warranties', 500);
  }
};
