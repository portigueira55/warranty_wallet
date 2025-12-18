import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

// Dashboard del fabricante
export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const manufacturerId = req.user!.id;

    // Estadísticas básicas
    const [totalProducts, totalWarranties, pendingClaims, resolvedClaims] = await Promise.all([
      prisma.product.count({ where: { manufacturerId } }),
      prisma.warrantyItem.count({
        where: { product: { manufacturerId } },
      }),
      prisma.warrantyClaim.count({
        where: { manufacturerId, status: 'pending' },
      }),
      prisma.warrantyClaim.count({
        where: { manufacturerId, status: 'resolved' },
      }),
    ]);

    const stats = {
      totalProducts,
      totalWarranties,
      pendingClaims,
      resolvedClaims,
    };

    sendSuccess(res, stats);
  } catch (error) {
    console.error('Get dashboard error:', error);
    sendError(res, 'Error fetching dashboard', 500);
  }
};

// Lista de productos
export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      where: { manufacturerId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, products);
  } catch (error) {
    console.error('Get products error:', error);
    sendError(res, 'Error fetching products', 500);
  }
};

// Crear producto
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sku, name, category, defaultWarrantyMonths, imageUrl } = req.body;

    const product = await prisma.product.create({
      data: {
        manufacturerId: req.user!.id,
        sku,
        name,
        category,
        defaultWarrantyMonths,
        imageUrl,
      },
    });

    sendSuccess(res, product, 'Product created successfully', 201);
  } catch (error) {
    console.error('Create product error:', error);
    sendError(res, 'Error creating product', 500);
  }
};

// Obtener reclamos
export const getClaims = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;

    const where: any = {
      manufacturerId: req.user!.id,
    };

    if (status) {
      where.status = status;
    }

    const claims = await prisma.warrantyClaim.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        warrantyItem: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    sendSuccess(res, claims);
  } catch (error) {
    console.error('Get claims error:', error);
    sendError(res, 'Error fetching claims', 500);
  }
};

// Responder a reclamo
export const updateClaim = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, manufacturerResponse } = req.body;

    const claim = await prisma.warrantyClaim.findFirst({
      where: {
        id,
        manufacturerId: req.user!.id,
      },
    });

    if (!claim) {
      sendError(res, 'Claim not found', 404);
      return;
    }

    const updatedClaim = await prisma.warrantyClaim.update({
      where: { id },
      data: {
        status,
        manufacturerResponse,
        resolvedAt: status === 'resolved' ? new Date() : null,
      },
      include: {
        user: true,
        warrantyItem: {
          include: {
            product: true,
          },
        },
      },
    });

    sendSuccess(res, updatedClaim, 'Claim updated successfully');
  } catch (error) {
    console.error('Update claim error:', error);
    sendError(res, 'Error updating claim', 500);
  }
};
