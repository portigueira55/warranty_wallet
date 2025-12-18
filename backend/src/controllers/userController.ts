import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest, CreateWarrantyData, CreateClaimData } from '../types';
import { sendSuccess, sendError } from '../utils/response';

// Obtener perfil del usuario
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    sendSuccess(res, user);
  } catch (error) {
    console.error('Get profile error:', error);
    sendError(res, 'Error fetching profile', 500);
  }
};

// Actualizar perfil
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username, phone } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { username, phone },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
      },
    });

    sendSuccess(res, user, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    sendError(res, 'Error updating profile', 500);
  }
};

// Obtener garantías del usuario
export const getWarranties = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query;

    const where: any = {
      userId: req.user!.id,
    };

    // Filtrar por estado si se proporciona
    if (status) {
      where.items = {
        some: {
          status: status as string,
        },
      };
    }

    // Buscar por nombre de tienda o número de ticket
    if (search) {
      where.OR = [
        { storeName: { contains: search as string, mode: 'insensitive' } },
        { ticketNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const warranties = await prisma.warranty.findMany({
      where,
      include: {
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
        purchaseDate: 'desc',
      },
    });

    sendSuccess(res, warranties);
  } catch (error) {
    console.error('Get warranties error:', error);
    sendError(res, 'Error fetching warranties', 500);
  }
};

// Crear nueva garantía
export const createWarranty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data: CreateWarrantyData = req.body;

    const warranty = await prisma.warranty.create({
      data: {
        userId: req.user!.id,
        storeName: data.storeName,
        storeAddress: data.storeAddress,
        ticketNumber: data.ticketNumber,
        purchaseDate: new Date(data.purchaseDate),
        purchaseTime: data.purchaseTime || null,
        totalAmount: data.totalAmount,
        ticketImageUrl: data.ticketImageUrl,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            sku: item.sku,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            warrantyEndDate: new Date(item.warrantyEndDate),
            serialNumber: item.serialNumber,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    sendSuccess(res, warranty, 'Warranty created successfully', 201);
  } catch (error) {
    console.error('Create warranty error:', error);
    sendError(res, 'Error creating warranty', 500);
  }
};

// Obtener detalle de garantía
export const getWarrantyDetail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const warranty = await prisma.warranty.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                manufacturer: true,
              },
            },
            warrantyClaims: true,
            warrantyExtensions: true,
          },
        },
      },
    });

    if (!warranty) {
      sendError(res, 'Warranty not found', 404);
      return;
    }

    sendSuccess(res, warranty);
  } catch (error) {
    console.error('Get warranty detail error:', error);
    sendError(res, 'Error fetching warranty detail', 500);
  }
};

// Eliminar garantía
export const deleteWarranty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const warranty = await prisma.warranty.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!warranty) {
      sendError(res, 'Warranty not found', 404);
      return;
    }

    await prisma.warranty.delete({
      where: { id },
    });

    sendSuccess(res, null, 'Warranty deleted successfully');
  } catch (error) {
    console.error('Delete warranty error:', error);
    sendError(res, 'Error deleting warranty', 500);
  }
};

// Crear reclamo de garantía
export const createClaim = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data: CreateClaimData = req.body;

    // Verificar que el warranty item pertenece al usuario
    const warrantyItem = await prisma.warrantyItem.findFirst({
      where: {
        id: data.warrantyItemId,
        warranty: {
          userId: req.user!.id,
        },
      },
      include: {
        product: {
          include: {
            manufacturer: true,
          },
        },
      },
    });

    if (!warrantyItem) {
      sendError(res, 'Warranty item not found', 404);
      return;
    }

    // Generar número de caso
    const caseNumber = `WC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const claim = await prisma.warrantyClaim.create({
      data: {
        warrantyItemId: data.warrantyItemId,
        userId: req.user!.id,
        manufacturerId: warrantyItem.product?.manufacturerId,
        issueDescription: data.issueDescription,
        caseNumber,
        photos: data.photos ? JSON.stringify(data.photos) : null,
        videos: data.videos ? JSON.stringify(data.videos) : null,
      },
      include: {
        warrantyItem: {
          include: {
            product: {
              include: {
                manufacturer: true,
              },
            },
          },
        },
      },
    });

    sendSuccess(res, claim, 'Claim created successfully', 201);
  } catch (error) {
    console.error('Create claim error:', error);
    sendError(res, 'Error creating claim', 500);
  }
};

// Obtener notificaciones
export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user!.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    sendSuccess(res, notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    sendError(res, 'Error fetching notifications', 500);
  }
};

// Marcar notificación como leída
export const markNotificationRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.updateMany({
      where: {
        id,
        userId: req.user!.id,
      },
      data: {
        read: true,
      },
    });

    if (notification.count === 0) {
      sendError(res, 'Notification not found', 404);
      return;
    }

    sendSuccess(res, null, 'Notification marked as read');
  } catch (error) {
    console.error('Mark notification read error:', error);
    sendError(res, 'Error updating notification', 500);
  }
};
