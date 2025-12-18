/**
 * Dashboard principal con estadísticas
 */

import React, { useEffect, useState } from 'react';
import { Users, Building2, FileText, TrendingUp } from 'lucide-react';
import { apiClient } from '../services/api';
import { API_ENDPOINTS } from '../config/api';

interface DashboardStats {
  totalUsers: number;
  totalManufacturers: number;
  totalWarranties: number;
  activeClaims: number;
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalManufacturers: 0,
    totalWarranties: 0,
    activeClaims: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.ADMIN.DASHBOARD);
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Usuarios Totales',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Fabricantes',
      value: stats.totalManufacturers,
      icon: Building2,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Garantías',
      value: stats.totalWarranties,
      icon: FileText,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Reclamaciones Activas',
      value: stats.activeClaims,
      icon: TrendingUp,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Vista general del sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`w-8 h-8 text-white ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Actividad Reciente
        </h2>
        <p className="text-gray-500">
          Aquí se mostrará la actividad reciente del sistema.
        </p>
      </div>
    </div>
  );
}
