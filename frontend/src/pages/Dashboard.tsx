import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  AlertCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Calendar,
  Package,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { warrantiesAPI } from '../lib/api';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export function Dashboard() {
  const { data: warranties = [], isLoading } = useQuery({
    queryKey: ['warranties'],
    queryFn: warrantiesAPI.getAll,
  });

  // Calculate statistics
  const stats = {
    total: warranties.length,
    active: warranties.filter((w) => w.status === 'active').length,
    expiringSoon: warranties.filter((w) => {
      const daysUntilExpiry = differenceInDays(new Date(w.expiry_date), new Date());
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30 && w.status === 'active';
    }).length,
    expired: warranties.filter((w) => w.status === 'expired').length,
    totalValue: warranties
      .filter((w) => w.status === 'active')
      .reduce((sum, w) => sum + (w.price || 0), 0),
  };

  // Category distribution
  const categoryData = warranties.reduce((acc: Record<string, number>, w) => {
    const category = w.category || 'Sin categoría';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

  // Monthly warranties
  const monthlyData = warranties.reduce((acc: Record<string, number>, w) => {
    const month = format(new Date(w.purchase_date), 'MMM yyyy', { locale: es });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.entries(monthlyData)
    .slice(-6)
    .map(([month, count]) => ({
      month,
      count,
    }));

  // Recent warranties
  const recentWarranties = [...warranties]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Expiring soon
  const expiringSoon = warranties
    .filter((w) => {
      const daysUntilExpiry = differenceInDays(new Date(w.expiry_date), new Date());
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30 && w.status === 'active';
    })
    .sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Resumen de tus garantías y estadísticas
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Garantías</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
            </div>
            <div className="rounded-full bg-primary-100 p-3 dark:bg-primary-900">
              <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Activas</p>
              <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.active}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
              <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Por Vencer</p>
              <p className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.expiringSoon}
              </p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900">
              <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Valor Total</p>
              <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
                ${stats.totalValue.toLocaleString()}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
              <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Garantías por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Expiring Soon */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Por Vencer (Próximos 30 días)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expiringSoon.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No hay garantías por vencer pronto
              </p>
            ) : (
              <div className="space-y-4">
                {expiringSoon.map((warranty) => {
                  const daysLeft = differenceInDays(new Date(warranty.expiry_date), new Date());
                  return (
                    <div
                      key={warranty.id}
                      className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900 dark:bg-yellow-950"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {warranty.product_name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {warranty.brand} {warranty.model}
                        </p>
                      </div>
                      <Badge variant="warning">{daysLeft} días</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Warranties */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary-600" />
              Añadidas Recientemente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentWarranties.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No hay garantías aún
              </p>
            ) : (
              <div className="space-y-4">
                {recentWarranties.map((warranty) => (
                  <div
                    key={warranty.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {warranty.product_name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDistanceToNow(new Date(warranty.created_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </p>
                    </div>
                    <Badge variant="success">Nueva</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
